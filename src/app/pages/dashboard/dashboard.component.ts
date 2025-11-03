import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  stats = [
    {
      count: 2,
      label: 'Total Departments',
      icon: 'bi-clipboard',
      color: 'blue',
    },
    {
      count: 2,
      label: 'Total Designations',
      icon: 'bi-diagram-3',
      color: 'green',
    },
    { count: 2, label: 'Total Users', icon: 'bi-person', color: 'yellow' },
    { count: 2, label: 'Total Employees', icon: 'bi-people', color: 'purple' },
    { count: 2, label: 'Total Evaluators', icon: 'bi-eye', color: 'violet' },
    { count: 3, label: 'Total Tasks', icon: 'bi-alarm', color: 'cyan' },
  ];
}
