import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Employee_Managements';
  constructor(private router: Router) {
    localStorage.clear();
    console.log('Registered Routes:', this.router.config);
  }
}
