import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { resolveApiMessage } from '../../utils/api-message.util';
import { AuthService } from '../../services/auth.service';

export interface UserOptionDto {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  displayLabel?: string | null;
}

@Component({
  selector: 'app-employee',
  imports: [
    ButtonModule,
    FormsModule,
    CommonModule,
    DialogModule,
    SelectModule,
    TableModule,
  ],
  templateUrl: './employee.component.html',
})
export class EmployeeComponent {
  employees: any[] = [];
  selectedEmployee: any = null;
  dialogVisible: boolean = false;
  dialogMode: 'view' | 'edit' | 'delete' | 'add' | '' = '';

  unlinkedUsers: UserOptionDto[] = [];
  departmentsList: { id: number; name: string }[] = [];
  designationsList: { id: number; title: string }[] = [];

  addMode: 'existing' | 'new' = 'existing';
  addUserId: number | null = null;
  addUsername = '';
  addFirstName = '';
  addLastName = '';
  addPassword = '';
  addDepartmentId: number | null = null;
  addDesignationId: number | null = null;
  addHireDate = '';

  constructor(
    private api: ApiClient,
    private loader: NgxUiLoaderService,
    private messageService: MessageService,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.getAllEmployees();
  }

  private unwrapList(res: unknown): any[] {
    const r = res as Record<string, unknown>;
    const inner = r['data'];
    if (Array.isArray(inner)) return inner;
    if (Array.isArray(res)) return res as any[];
    return [];
  }

  getAllEmployees() {
    this.loader.start();
    this.api.get('employees/getAllEmployees').subscribe({
      next: (res: any) => {
        this.employees = this.unwrapList(res);
        this.loader.stop();
      },
      error: (err) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Employees',
          detail: resolveApiMessage(err, 'Could not load employees.'),
        });
      },
    });
  }

  private resetAddForm() {
    this.addMode = 'existing';
    this.addUserId = null;
    this.addUsername = '';
    this.addFirstName = '';
    this.addLastName = '';
    this.addPassword = '';
    this.addDepartmentId = null;
    this.addDesignationId = null;
    this.addHireDate = '';
    this.unlinkedUsers = [];
    this.departmentsList = [];
    this.designationsList = [];
  }

  private loadAddReferenceData() {
    this.loader.start();
    forkJoin({
      users: this.api.get('employees/unlinked-users'),
      departments: this.api.get('departments/getAllDepartments'),
      designations: this.api.get('designations/getAllDesignations'),
    }).subscribe({
      next: (bundle) => {
        this.unlinkedUsers = this.unwrapList(bundle.users) as UserOptionDto[];
        this.departmentsList = this.unwrapList(bundle.departments).map((d: any) => ({
          id: Number(d.id),
          name: d.name ?? '',
        }));
        this.designationsList = this.unwrapList(bundle.designations).map((x: any) => ({
          id: Number(x.id),
          title: x.title ?? '',
        }));
        this.loader.stop();
      },
      error: (err) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Add employee',
          detail: resolveApiMessage(
            err,
            'Could not load users, departments, or designations.'
          ),
        });
      },
    });
  }

  userOptionLabel(u: UserOptionDto): string {
    if (u.displayLabel) return u.displayLabel;
    const fn = (u.firstName ?? '').trim();
    const ln = (u.lastName ?? '').trim();
    const name = `${fn} ${ln}`.trim();
    if (name.length > 0) return `${name} (${u.username})`;
    return u.username;
  }

  get unlinkedUserSelectOptions(): { id: number; label: string }[] {
    return this.unlinkedUsers.map((u) => ({
      id: u.id,
      label: this.userOptionLabel(u),
    }));
  }

  openDialog(employee: any, mode: 'view' | 'add' | 'edit' | 'delete') {
    this.selectedEmployee = { ...employee };
    if (mode === 'add') {
      this.resetAddForm();
      this.selectedEmployee = {};
      this.loadAddReferenceData();
    }
    this.dialogMode = mode;
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.dialogMode = '';
    this.resetAddForm();
  }

  confirmDelete() {
    if (!this.selectedEmployee) return;
    this.loader.start();
    this.api.get(`employees/delete/${this.selectedEmployee.id}`).subscribe({
      next: () => {
        this.getAllEmployees();
        this.closeDialog();
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Employee removed successfully.',
        });
      },
      error: (err) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Delete failed',
          detail: resolveApiMessage(err, 'Could not delete employee.'),
        });
      },
    });
  }

  saveChanges() {
    if (this.dialogMode === 'edit') {
      this.loader.start();
      const payload = {
        employeeId: this.selectedEmployee.id,
        designationId: this.selectedEmployee.designation?.id,
        designationTitle: this.selectedEmployee.designation?.title,
        departmentId: this.selectedEmployee.department?.id,
        departmentName: this.selectedEmployee.department?.name,
        firstName: this.selectedEmployee.user?.firstName,
        lastName: this.selectedEmployee.user?.lastName,
      };
      this.api
        .post(`employees/edit/${this.selectedEmployee.id}`, payload)
        .subscribe({
          next: () => {
            this.closeDialog();
            this.getAllEmployees();
            this.loader.stop();
            this.messageService.add({
              severity: 'success',
              summary: 'Saved',
              detail: 'Employee updated successfully.',
            });
          },
          error: (err) => {
            this.loader.stop();
            this.messageService.add({
              severity: 'error',
              summary: 'Update failed',
              detail: resolveApiMessage(err, 'Could not update employee.'),
            });
          },
        });
    }
  }

  addEmployee() {
    const hire = (this.addHireDate ?? '').trim();
    if (
      this.addDepartmentId == null ||
      Number.isNaN(this.addDepartmentId) ||
      this.addDesignationId == null ||
      Number.isNaN(this.addDesignationId) ||
      !hire
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Add employee',
        detail: 'Choose department, designation, and hire date.',
      });
      return;
    }

    const body: Record<string, unknown> = {
      departmentId: this.addDepartmentId,
      designationId: this.addDesignationId,
      hireDate: hire,
    };

    if (this.addMode === 'existing') {
      if (this.addUserId == null) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Add employee',
          detail: 'Select a user, or switch to “Create new account”.',
        });
        return;
      }
      body['userId'] = this.addUserId;
    } else {
      const u = (this.addUsername ?? '').trim();
      const fn = (this.addFirstName ?? '').trim();
      const ln = (this.addLastName ?? '').trim();
      if (!u || !fn || !ln) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Add employee',
          detail: 'Username, first name, and last name are required for a new account.',
        });
        return;
      }
      body['username'] = u;
      body['firstName'] = fn;
      body['lastName'] = ln;
      const pw = (this.addPassword ?? '').trim();
      if (pw.length > 0) {
        body['password'] = pw;
      }
    }

    this.loader.start();
    this.api.post('employees/add', body).subscribe({
      next: () => {
        this.getAllEmployees();
        this.closeDialog();
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Employee added',
          detail:
            this.addMode === 'new'
              ? 'Account created. Default password is admin unless you set one.'
              : 'Employee linked to the selected user.',
        });
      },
      error: (err) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add employee',
          detail: resolveApiMessage(err, 'Request failed.'),
        });
      },
    });
  }
}
