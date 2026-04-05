import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ApiClient } from '../../services/api-client.service';
import { FormsModule } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { resolveApiMessage } from '../../utils/api-message.util';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
  ],
  templateUrl: './departments.component.html',
})
export class DepartmentsComponent implements OnInit {
  departments: any[] = [];
  selectedDepartment: any = null;
  dialogVisible: boolean = false;
  dialogMode: 'view' | 'edit' | 'delete' | 'add' | '' = '';

  constructor(
    private api: ApiClient,
    private loader: NgxUiLoaderService,
    private messageService: MessageService,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.getAllDepartments();
  }

  getAllDepartments() {
    this.loader.start();
    this.api.get('departments/getAllDepartments').subscribe({
      next: (res: any) => {
        this.departments = res.data || res;
        this.loader.stop();
      },
      error: (err) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Departments',
          detail: resolveApiMessage(err, 'Could not load departments.'),
        });
      },
    });
  }

  openDialog(dept: any, mode: 'view' | 'add' | 'edit' | 'delete') {
    this.selectedDepartment = { ...dept };
    if (mode === 'add') {
      this.selectedDepartment = { name: '', description: '' };
    }
    this.dialogMode = mode;
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.dialogMode = '';
  }

  confirmDelete() {
    if (!this.selectedDepartment) return;
    this.loader.start();
    this.api
      .get(`departments/delete/${this.selectedDepartment.id}`)
      .subscribe({
        next: () => {
          this.getAllDepartments();
          this.closeDialog();
          this.loader.stop();
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Department removed successfully.',
          });
        },
        error: (err) => {
          this.loader.stop();
          this.messageService.add({
            severity: 'error',
            summary: 'Delete failed',
            detail: resolveApiMessage(err, 'Could not delete department.'),
          });
        },
      });
  }

  saveChanges() {
    if (this.dialogMode === 'edit') {
      this.loader.start();
      console.log(this.selectedDepartment);
      this.api
        .post(
          `departments/edit/${this.selectedDepartment.id}`,
          this.selectedDepartment
        )
        .subscribe({
          next: () => {
            this.closeDialog();
            this.getAllDepartments();
            this.loader.stop();
            this.messageService.add({
              severity: 'success',
              summary: 'Saved',
              detail: 'Department updated successfully.',
            });
          },
          error: (err) => {
            this.loader.stop();
            this.messageService.add({
              severity: 'error',
              summary: 'Update failed',
              detail: resolveApiMessage(err, 'Could not update department.'),
            });
          },
        });
    }
  }
  addDepartment() {
    this.loader.start();
    this.api.post('departments/add', this.selectedDepartment).subscribe({
      next: () => {
        this.getAllDepartments();
        this.closeDialog();
        this.loader.stop();
        this.messageService.add({
          severity: 'success',
          summary: 'Added',
          detail: 'Department created successfully.',
        });
      },
      error: (err) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Could not add',
          detail: resolveApiMessage(err, 'Could not create department.'),
        });
      },
    });
  }
}
