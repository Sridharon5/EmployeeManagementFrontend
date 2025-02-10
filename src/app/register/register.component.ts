import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { routes } from '../app.routes';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class UserRegistrationComponent implements OnInit {
  userForm!: FormGroup;
  registrationSuccess: boolean = false;
  errorMessage: string = '';

  // ✅ Inject Router in the constructor
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router // ✅ Inject Router here
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required],
      role: ['USER', Validators.required]  // Setting default role
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const user: User = this.userForm.value;
      console.log(user);
  
      this.authService.register(user).subscribe({
        next: (response: string) => { 
          console.log('Registration successful:', response);
          this.registrationSuccess = true;
          this.errorMessage = '';
          this.userForm.reset();

          // ✅ Redirect to '/default' after registration
          this.router.navigate(['/default']);
        },
        error: (err) => {
          console.error('Registration failed', err);
          this.errorMessage = 'Registration failed. Please try again.';
        }
      });
    } else {
      console.warn("Form is invalid");
    }
  }
}
