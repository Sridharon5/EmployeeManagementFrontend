import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../../services/api-client.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit {
  departments: any[] = [];
  selectedDepartment: any = null;
  dialogVisible: boolean = false;
  dialogMode: 'view' | 'edit' | 'delete' | null = null;

  constructor(private api: ApiClient) {}

  ngOnInit(): void {
    this.fetchDepartments();
  }

  fetchDepartments() {
    // this.api.get('departments').subscribe({
    //   next: (res: any) => {
    //     this.departments = res.data || res; // Adjust based on backend response
    //   },
    //   error: (err) => {
    //     console.error('Error fetching departments', err);
    //   }
    // });
  }

  openDialog(dept: any, mode: 'view' | 'edit' | 'delete') {
    this.selectedDepartment = { ...dept };
    this.dialogMode = mode;
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.dialogMode = null;
  }

  confirmDelete() {
    if (!this.selectedDepartment) return;
    // this.api.delete(`departments/${this.selectedDepartment.id}`).subscribe({
    //   next: () => {
    //     this.fetchDepartments();
    //     this.closeDialog();
    //   },
    //   error: (err) => console.error('Delete failed', err)
    // });
  }

  saveChanges() {
    if (this.dialogMode === 'edit') {
      // this.api.put(`departments/${this.selectedDepartment.id}`, this.selectedDepartment)
      //   .subscribe({
      //     next: () => {
      //       this.fetchDepartments();
      //       this.closeDialog();
      //     },
      //     error: (err) => console.error('Update failed', err)
      //   });
    }
  }
}
