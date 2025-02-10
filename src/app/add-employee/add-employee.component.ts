import { Component } from '@angular/core';
import { EmployeeService } from '../services/employee.service'; // Adjust path
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-employee',
  imports:[CommonModule,FormsModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent {
  employee = {
    firstName: '',
    lastName: '',
    email: ''
  };

  constructor(private employeeService: EmployeeService, private router: Router) {}

  onSubmit() {
    this.employeeService.createEmployee(this.employee).subscribe(
      (response) => {
        console.log('Employee added successfully!', response);
        this.router.navigate(['/employee-list']);  // Navigate to the employee list after successful creation
      },
      (error) => {
        console.error('Error adding employee:', error);
      }
    );
  }
}
