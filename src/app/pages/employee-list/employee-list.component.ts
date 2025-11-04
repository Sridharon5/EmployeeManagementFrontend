import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router';  
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  standalone:true,
  imports: [RouterModule, CommonModule],
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = []; 
  userRole: string | null = null; // Store the user's role

  constructor(
    private api:ApiClient,
    private loader:NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }
  

  getEmployees(): void {
    this.loader.start();
    this.api.get('employees').subscribe({
      next: (res: any) => {
      this.employees=res.data;
      this.loader.stop();
        
      },
      error: (err: any) => {
        this.loader.stop();
      },
    });
  }

  // deleteEmployee(id: string): void {
  //   if (this.userRole !== 'ADMIN') {
  //     alert('You are not authorized to delete employees.');
  //     return;
  //   }

  //   if (confirm('Are you sure you want to delete this employee?')) {
  //     this.employeeService.deleteEmployee(Number(id)).subscribe(
  //       () => {
  //         this.employees = this.employees.filter(e => e.id !== id);
  //         this.getEmployees();  

  //         this.router.navigateByUrl('/employee-list', { skipLocationChange: true }).then(() => {
  //           this.router.navigate(['/employee-list']);
  //         });
  //       },
  //       (error) => {
  //         console.error('Error deleting employee', error);
  //       }
  //     );
  //   }
  // }
}
