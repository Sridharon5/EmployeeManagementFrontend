import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  // Add Router for navigation
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  employee: Employee | undefined;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private router: Router  // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    // Get the employee ID from route params
    const employeeId = this.route.snapshot.paramMap.get('id');
    if (employeeId) {
      // Fetch employee details
      this.employeeService.getEmployee(employeeId).subscribe(
        (data) => {
          this.employee = data;
        },
        (error) => {
          console.error('Error fetching employee details', error);
          // You can handle error (e.g., show a message or redirect to a different page)
        }
      );
    } else {
      console.error('Employee ID is missing in the route.');
    }
  }

  // Method to navigate back to employee list page
  goBack(): void {
    this.router.navigate(['/employee-list']);
  }
}
