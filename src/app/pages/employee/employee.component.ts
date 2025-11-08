import { Component } from '@angular/core';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-employee',
  imports: [ButtonModule, FormsModule, CommonModule, DialogModule, TableModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss',
})
export class EmployeeComponent {
  employees: any[] = [];
  selectedEmployee: any = null;
  dialogVisible: boolean = false;
  dialogMode: 'view' | 'edit' | 'delete' | 'add' | '' = '';

  constructor(private api: ApiClient, private loader: NgxUiLoaderService) {}

  ngOnInit(): void {
    this.getAllEmployees();
  }

  getAllEmployees() {
    this.loader.start();
    this.api.get('employees/getAllEmployees').subscribe({
      next: (res: any) => {
        this.employees = res.data || res;
        this.loader.stop();
      },
      error: (err) => {
        console.error('Error fetching employees', err);
        this.loader.stop();
      },
    });
  }

  openDialog(employee: any, mode: 'view' | 'add' | 'edit' | 'delete') {
    this.selectedEmployee = { ...employee };
    if (mode === 'add') {
      this.selectedEmployee = {
        user: {
          firstName: '',
          lastName: '',
        },
        department: {
          name: '',
        },
        designation: {
          title: '',
        },
      };
    }
    this.dialogMode = mode;
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.dialogMode = '';
  }

  confirmDelete() {
    if (!this.selectedEmployee) return;
    this.loader.start();
    this.api.get(`employees/delete/${this.selectedEmployee.id}`).subscribe({
      next: () => {
        this.getAllEmployees();
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
        const payload = {
    employeeId: this.selectedEmployee.id,
    designationId: this.selectedEmployee.designation?.id,
    designationTitle: this.selectedEmployee.designation?.title,
    departmentId: this.selectedEmployee.department?.id,
    departmentName: this.selectedEmployee.department?.name,
    firstName: this.selectedEmployee.user?.firstName,
    lastName: this.selectedEmployee.user?.lastName,
  };
   console.log('Edit Employee', payload);
      this.api
        .post(
          `employees/edit/${this.selectedEmployee.id}`,
        payload
        )
        .subscribe({
          next: () => {
            this.closeDialog();
            this.getAllEmployees();
          },
          error: (err) => {
            console.error('Update failed', err), this.loader.stop();
          },
        });
    }
  }
  addEmployee() {
    this.loader.start();
    console.log('Selected Employee', this.selectedEmployee);
    //  this.api.post('employees/add', this.selectedEmployee).subscribe({
    //    next: () => {
    //      this.getAllEmployees();
    //      this.closeDialog();
    //      this.loader.stop();
    //    },
    //    error: (err) => {
    //      console.error('Update failed', err), this.loader.stop();
    //    },
    //  });
  }
}
