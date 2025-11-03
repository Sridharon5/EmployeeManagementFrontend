import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ApiClient } from '../../services/api-client.service';
import { FormsModule } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {
  departments: any[] = [];
  selectedDepartment: any = null;
  dialogVisible: boolean = false;
  dialogMode: 'view' | 'edit' | 'delete' | '' = '';

  constructor(private api: ApiClient, private loader: NgxUiLoaderService) {}

  ngOnInit(): void {
    this.getAllDepartments();
  }

  getAllDepartments() {
    this.loader.start();
    this.api.getDepartmentUrl('getAllDepartments').subscribe({
      next: (res: any) => {
        this.departments = res.data || res;
        this.loader.stop();
      },
      error: (err) => {
        console.error('Error fetching departments', err);
        this.loader.stop();
      },
    });
  }

  openDialog(dept: any, mode: 'view' | 'edit' | 'delete') {
    this.selectedDepartment = { ...dept };
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
      .getEmployeeUrl(`departments/${this.selectedDepartment.id}`)
      .subscribe({
        next: () => {
          this.getAllDepartments();
          this.closeDialog();
          this.loader.stop();
        },
        error: (err) => {
          console.error('Delete failed', err), this.loader.stop();
        },
      });
  }

  saveChanges() {
    if (this.dialogMode === 'edit') {
      this.loader.start();
      this.api
        .post(
          `departments/${this.selectedDepartment.id}`,
          this.selectedDepartment
        )
        .subscribe({
          next: () => {
            this.getAllDepartments();
            this.closeDialog();
            this.loader.stop();
          },
          error: (err) => {
            console.error('Update failed', err), this.loader.stop();
          },
        });
    }
  }
}
