import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit{
  constructor(private api:ApiClient,private loader:NgxUiLoaderService){

  }
  stats:any[]=[];
  ngOnInit(): void {
   this.getKeyPointIndicators();
  }
  getKeyPointIndicators(){
    this.loader.start();
    this.api
      .get('auth/getKeyPointIndicators')
      .subscribe({
        next: (res:any) => {
          this.stats=res;
          this.loader.stop();
        },
        error: (err) => {
          console.error('Delete failed', err), 
          this.loader.stop();
        },
      });
  }
  // stats = [
  //   {
  //     count: 2,
  //     label: 'Total Departments',
  //     icon: 'bi-clipboard',
  //     color: 'blue',
  //   },
  //   {
  //     count: 2,
  //     label: 'Total Designations',
  //     icon: 'bi-diagram-3',
  //     color: 'green',
  //   },
  //   { count: 2, label: 'Total Users', icon: 'bi-person', color: 'yellow' },
  //   { count: 2, label: 'Total Employees', icon: 'bi-people', color: 'purple' },
  //   { count: 2, label: 'Total Evaluators', icon: 'bi-eye', color: 'violet' },
  //   { count: 3, label: 'Total Tasks', icon: 'bi-alarm', color: 'cyan' },
  // ];
}
