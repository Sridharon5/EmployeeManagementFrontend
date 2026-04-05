import { Component, inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TableLazyLoadEvent } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { resolveApiMessage } from '../../utils/api-message.util';
import { AuthService } from '../../services/auth.service';
import {
  SpringPage,
  TaskResponseDto,
  TaskStatus,
} from '../../models/task-dashboard.models';

@Component({
  selector: 'app-tasks',
  imports: [
    ButtonModule,
    FormsModule,
    DialogModule,
    SelectModule,
    CommonModule,
    TableModule,
  ],
  templateUrl: './tasks.component.html',
})
export class TasksComponent {
  private readonly locale = inject(LOCALE_ID);

  /** Admin assignee picker: employee id + display label. */
  assigneeOptions: { id: number; label: string }[] = [];

  tasks: TaskResponseDto[] = [];
  totalRecords = 0;
  pageSize = 5;
  lazyFirst = 0;
  loading = false;

  selectedTask: Record<string, unknown> | null = null;
  dialogVisible = false;
  dialogMode: 'view' | 'edit' | 'delete' | 'add' | 'close' | '' = '';
  closeTicketNote = '';

  readonly statusOptions: TaskStatus[] = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'OVERDUE',
    'REJECTED',
  ];

  get statusSelectOptions(): { value: TaskStatus; label: string }[] {
    return this.statusOptions.map((s) => ({
      value: s,
      label: this.formatStatus(s),
    }));
  }

  constructor(
    private api: ApiClient,
    private loader: NgxUiLoaderService,
    private messageService: MessageService,
    readonly auth: AuthService
  ) {}

  get tasksPageTitle(): string {
    return this.auth.isAdmin() ? 'Tasks' : 'My tasks';
  }

  get tasksPageLead(): string {
    return this.auth.isAdmin()
      ? 'Track assignments, due dates, and status across the organization.'
      : 'Work assigned to you. Start work, then close the ticket when done.';
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.pageSize;
    this.pageSize = rows;
    const first = event.first ?? 0;
    this.lazyFirst = first;
    const page = Math.floor(first / rows);
    this.loadPage(page, rows);
  }

  private parsePage(raw: unknown): SpringPage<TaskResponseDto> {
    const r = raw as Record<string, unknown>;
    const payload = (r['data'] ?? r) as Record<string, unknown>;
    const content = payload['content'];
    if (Array.isArray(content)) {
      return payload as unknown as SpringPage<TaskResponseDto>;
    }
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: this.pageSize,
      number: 0,
    };
  }

  loadPage(page: number, size: number): void {
    this.loading = true;
    this.loader.start();
    const scope = this.auth.isAdmin() ? 'all' : 'my';
    const params = new HttpParams()
      .set('scope', scope)
      .set('page', String(page))
      .set('size', String(size))
      .set('sort', 'dueDate,asc');
    this.api.get('tasks', { params }).subscribe({
      next: (raw) => {
        const p = this.parsePage(raw);
        this.tasks = p.content ?? [];
        this.totalRecords = p.totalElements ?? 0;
        this.loading = false;
        this.loader.stop();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.loader.stop();
        this.tasks = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: this.tasksPageTitle,
          detail: resolveApiMessage(err, 'Could not load tasks.'),
        });
      },
    });
  }

  rowDisplayIndex(rowIndex: number): number {
    return this.lazyFirst + rowIndex + 1;
  }

  private parseEmployeeList(raw: unknown): Record<string, unknown>[] {
    const r = raw as Record<string, unknown>;
    const inner = r['data'];
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    if (Array.isArray(raw)) return raw as Record<string, unknown>[];
    return [];
  }

  /** First name required for label; last name optional; then username; last resort #id. */
  formatEmployeeOption(emp: Record<string, unknown>): string {
    const user = emp['user'] as Record<string, unknown> | undefined;
    const fn = String(user?.['firstName'] ?? '').trim();
    const ln = String(user?.['lastName'] ?? '').trim();
    if (fn.length > 0) {
      return ln.length > 0 ? `${fn} ${ln}` : fn;
    }
    const un = String(user?.['username'] ?? '').trim();
    if (un.length > 0) return un;
    const id = emp['id'];
    return id != null ? `Employee #${id}` : '—';
  }

  loadAssigneeOptions(): void {
    this.api.get('employees/getAllEmployees').subscribe({
      next: (raw) => {
        this.assigneeOptions = this.parseEmployeeList(raw).map((e) => ({
          id: Number(e['id']),
          label: this.formatEmployeeOption(e),
        }));
      },
      error: () => {
        this.assigneeOptions = [];
      },
    });
  }

  /**
   * Shows assignee as first name (required for a proper label) + optional last name.
   * Falls back to username, then employee id, if names are missing.
   */
  assigneeLabel(task: TaskResponseDto): string {
    const myId = this.auth.getUserId();
    if (
      !this.auth.isAdmin() &&
      task.assignedToUserId != null &&
      myId != null &&
      task.assignedToUserId === myId
    ) {
      return 'You';
    }
    const first = (task.assigneeFirstName ?? '').trim();
    const last = (task.assigneeLastName ?? '').trim();
    if (first.length > 0) {
      return last.length > 0 ? `${first} ${last}` : first;
    }
    const user = (task.assigneeUsername ?? '').trim();
    if (user.length > 0) {
      return user;
    }
    if (task.assignedToEmployeeId != null) {
      return `Employee #${task.assignedToEmployeeId}`;
    }
    return '—';
  }

  formatStatus(status: unknown): string {
    if (status == null || status === '') return '—';
    const s = String(status);
    return s
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  }

  assigneeLabelFromSelected(): string {
    if (!this.selectedTask) return '—';
    return this.assigneeLabel(this.selectedTask as unknown as TaskResponseDto);
  }

  private coerceDatePipeValue(v: unknown): string | number | Date | null {
    if (v == null || v === '') return null;
    if (v instanceof Date) return v;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return v;
    return null;
  }

  /** Typed for strict `date` pipe (avoids `Record` index `{}` inference). */
  selectedDueDateForView(): string | number | Date | null {
    return this.coerceDatePipeValue(this.selectedTask?.['dueDate']);
  }

  selectedClosedAtForView(): string | number | Date | null {
    return this.coerceDatePipeValue(this.selectedTask?.['closedAt']);
  }

  /** Pre-formatted for view dialog — avoids strict-template issues with `date` pipe + `Record` indexing. */
  selectedDueDateFormatted(): string {
    const v = this.selectedDueDateForView();
    if (v == null) return '';
    try {
      return formatDate(v, 'dd-MMM-yyyy', this.locale);
    } catch {
      return '';
    }
  }

  selectedClosedAtFormatted(): string {
    const v = this.selectedClosedAtForView();
    if (v == null) return '';
    try {
      return formatDate(v, 'dd-MMM-yyyy', this.locale);
    } catch {
      return '';
    }
  }

  isOpenStatus(status: TaskStatus): boolean {
    return status === 'PENDING' || status === 'IN_PROGRESS' || status === 'OVERDUE';
  }

  canUserStart(task: TaskResponseDto): boolean {
    return (
      !this.auth.isAdmin() &&
      (task.status === 'PENDING' || task.status === 'OVERDUE')
    );
  }

  canUserClose(task: TaskResponseDto): boolean {
    return !this.auth.isAdmin() && this.isOpenStatus(task.status);
  }

  openDialog(
    task: Partial<TaskResponseDto> | Record<string, unknown>,
    mode: 'view' | 'add' | 'edit' | 'delete' | 'close'
  ): void {
    if (mode === 'add') {
      this.selectedTask = {
        title: '',
        description: '',
        dueDate: '',
        assignedToEmployeeId: null,
        status: 'PENDING',
      };
    } else {
      this.selectedTask = { ...(task as Record<string, unknown>) };
      const d = this.selectedTask['dueDate'];
      if (typeof d === 'string' && d.length > 10) {
        this.selectedTask['dueDate'] = d.slice(0, 10);
      }
    }
    if (mode === 'close') {
      this.closeTicketNote =
        (task as TaskResponseDto).completionNote != null
          ? String((task as TaskResponseDto).completionNote)
          : '';
    }
    if (this.auth.isAdmin() && (mode === 'add' || mode === 'edit')) {
      this.loadAssigneeOptions();
    }
    this.dialogMode = mode;
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
    this.dialogMode = '';
    this.selectedTask = null;
    this.closeTicketNote = '';
  }

  startWork(task: TaskResponseDto): void {
    this.loader.start();
    this.api.patch(`tasks/${task.id}`, { status: 'IN_PROGRESS' }).subscribe({
      next: () => {
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Started',
          detail: 'Task marked in progress.',
        });
        this.reloadCurrentPage();
      },
      error: (err: unknown) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Update failed',
          detail: resolveApiMessage(err, 'Could not update task status.'),
        });
      },
    });
  }

  submitCloseTicket(): void {
    if (!this.selectedTask?.['id']) return;
    this.loader.start();
    this.api
      .patch(`tasks/${this.selectedTask['id']}`, {
        status: 'COMPLETED',
        completionNote: this.closeTicketNote?.trim() || null,
      })
      .subscribe({
        next: () => {
          this.loader.stop();
          this.closeDialog();
          this.messageService.add({
            severity: 'success',
            summary: 'Ticket closed',
            detail: 'Task marked complete.',
          });
          this.reloadCurrentPage();
        },
        error: (err: unknown) => {
          this.loader.stop();
          this.messageService.add({
            severity: 'error',
            summary: 'Could not close',
            detail: resolveApiMessage(err, 'Could not complete task.'),
          });
        },
      });
  }

  private reloadCurrentPage(): void {
    const page = Math.floor(this.lazyFirst / this.pageSize);
    this.loadPage(page, this.pageSize);
  }

  confirmDelete(): void {
    if (!this.selectedTask?.['id']) return;
    this.loader.start();
    this.api.get(`tasks/delete/${this.selectedTask['id']}`).subscribe({
      next: () => {
        this.reloadCurrentPage();
        this.closeDialog();
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Task removed successfully.',
        });
      },
      error: (err: unknown) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: resolveApiMessage(err, 'Could not delete task.'),
        });
      },
    });
  }

  saveChanges(): void {
    if (!this.selectedTask?.['id']) return;
    const t = this.selectedTask;
    const ae = t['assignedToEmployeeId'];
    const assigneeId =
      ae === '' || ae == null || Number.isNaN(Number(ae)) ? null : Number(ae);
    if (assigneeId == null) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Update task',
        detail: 'Please select an assignee.',
      });
      return;
    }
    this.loader.start();
    const body: Record<string, unknown> = {
      title: t['title'],
      description: t['description'] || null,
      dueDate: t['dueDate'] || null,
      status: t['status'],
      completionNote: t['completionNote'] || null,
      assignedToEmployeeId: assigneeId,
    };

    this.api.patch(`tasks/${t['id']}`, body).subscribe({
      next: () => {
        this.closeDialog();
        this.reloadCurrentPage();
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Task updated successfully.',
        });
      },
      error: (err: unknown) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Update failed',
          detail: resolveApiMessage(err, 'Could not update task.'),
        });
      },
    });
  }

  addTask(): void {
    if (!this.selectedTask) return;
    const t = this.selectedTask;
    const title = String(t['title'] ?? '').trim();
    const due = String(t['dueDate'] ?? '').trim();
    const ae = t['assignedToEmployeeId'];
    const assigneeId =
      ae === '' || ae == null || Number.isNaN(Number(ae)) ? null : Number(ae);
    if (!title || !due || assigneeId == null) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Add task',
        detail: 'Title, due date, and assignee are required.',
      });
      return;
    }
    const body = {
      title,
      description: (t['description'] as string)?.trim() || null,
      dueDate: due,
      assignedToEmployeeId: assigneeId,
      status: (t['status'] as string) || 'PENDING',
    };
    this.loader.start();
    this.api.post('tasks/add', body).subscribe({
      next: () => {
        this.reloadCurrentPage();
        this.closeDialog();
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Added',
          detail: 'Task created successfully.',
        });
      },
      error: (err: unknown) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add',
          detail: resolveApiMessage(err, 'Could not create task.'),
        });
      },
    });
  }
}
