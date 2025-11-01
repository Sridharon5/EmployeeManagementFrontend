import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router';  
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  imports: [RouterModule, CommonModule],
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = []; 
  userRole: string | null = null; // Store the user's role

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService, // Inject AuthService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEmployees();
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }
  

  getEmployees(): void {
    this.employeeService.getAllEmployees().subscribe(
      (data) => {
        this.employees = data;
      },
      (error) => {
        console.error('Error fetching employees', error);
      }
    );
  }

  deleteEmployee(id: string): void {
    if (this.userRole !== 'ADMIN') {
      alert('You are not authorized to delete employees.');
      return;
    }

    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(Number(id)).subscribe(
        () => {
          this.employees = this.employees.filter(e => e.id !== id);
          this.getEmployees();  

          this.router.navigateByUrl('/employee-list', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/employee-list']);
          });
        },
        (error) => {
          console.error('Error deleting employee', error);
        }
      );
    }
  }
}
