import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-update-employee',
  imports:[CommonModule,FormsModule],
  templateUrl: './update-employee.component.html',
  styleUrls: ['./update-employee.component.css']
})
export class UpdateEmployeeComponent implements OnInit {
  employee: Employee = {
    firstName: '',
    lastName: '',
    email: ''
  };
  employeeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    // Retrieve the employeeId from the URL parameters
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.employeeService.getEmployee(this.employeeId).subscribe((data) => {
        this.employee = data;
        console.log('Employee data loaded:', this.employee);  // Log to verify data
      }, (error) => {
        console.error('Error loading employee data', error);
      });
    }
  }

  onSubmit(): void {
    if (this.employeeId && this.employee) {
      console.log('Submitting updated employee:', this.employee);  // Log to verify data before submitting

      this.employeeService.updateEmployee(this.employeeId, this.employee).subscribe(
        () => {
          console.log('Employee updated successfully');  // Log on successful update
          this.router.navigate(['/employee-list']);  // Navigate back to the employee list
        },
        (error) => {
          console.error('Error updating employee:', error);
        }
      );
    } else {
      console.error('Employee data or ID is missing');
    }
  }
}
