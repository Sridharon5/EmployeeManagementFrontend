import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';  // ✅ Import Router
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports:[FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };

  constructor(private authService: AuthService, private router: Router) { }  // ✅ Inject Router

  onSubmit(): void {
    this.authService.login(this.credentials.username, this.credentials.password).subscribe(
      response => {
        console.log('✅ Login successful:');
        console.log(response.role);
        this.router.navigate(['/employee-list']);  // ✅ Navigate to navbar
      },
      (error: HttpErrorResponse) => {
        console.error('❌ Login failed:', error);
      }
    );
  }
}
