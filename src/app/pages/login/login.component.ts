import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../../services/api-client.service';
import { PasswordModule } from 'primeng/password';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule,PasswordModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoginMode: boolean = false;
  registrationSuccess: boolean = false;
  errorMessage: string = '';
  signUpForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private api: ApiClient,
    private loader: NgxUiLoaderService
  ) {
    this.signUpForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
      ],
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          ),
        ],
      ],
    });

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

onLogin() {
    const payload = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };
    if (this.loginForm.invalid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      if (!username && !password) {
        this.errorMessage = 'Please enter Username and Password.';
      } else if (!username) {
        this.errorMessage = 'Please enter Username.';
      } else if (!password) {
        this.errorMessage = 'Please enter Password.';
      }

      return;
    }
    this.loader.start();
    this.api.post('auth/login', payload).subscribe({
      next: (res: any) => {
        this.authService.setIsAuthenticated(true);
        this.authService.setJwtToken(res.token);
        this.authService.setRole(res.role);
        this.authService.setFirstName(res.name);
        this.router.navigate(['dashboard']);
        console.log(res);
        this.loader.stop();
        this.errorMessage = 'Login was successful';
      },
      error: (err: any) => {
        this.loader.stop();
        this.errorMessage = 'Username or Password is incorrect';
      },
    });
  }
  onSignUp() {
     const username = this.signUpForm.get('username')?.value;
    const password = this.signUpForm.get('password')?.value;
    const firstName = this.signUpForm.get('firstName')?.value;
    const lastName = this.signUpForm.get('lastName')?.value;

    if (this.signUpForm.invalid) {
      if (!username && !password && !firstName && !lastName) {
        this.errorMessage = 'Please enter all required fields.';
        return;
      }
      if (!username) {
        this.errorMessage = 'Please enter Username.';
        return;
      }
      if (!firstName) {
        this.errorMessage = 'Please enter First Name.';
        return;
      }
      if (!lastName) {
        this.errorMessage = 'Please enter Last Name.';
        return;
      }
      if (!password) {
        this.errorMessage = 'Please enter Password.';
        return;
      }

      const usernameControl = this.signUpForm.get('username');
      const firstNameControl = this.signUpForm.get('firstName');
      const lastNameControl = this.signUpForm.get('lastName');
      const passwordControl = this.signUpForm.get('password');

      if (usernameControl?.hasError('minlength')) {
        this.errorMessage = 'Username must be at least 4 characters long.';
        return;
      }
      if (usernameControl?.hasError('pattern')) {
        this.errorMessage = 'Username can contain only letters, numbers, or underscores.';
        return;
      }
      if (firstNameControl?.hasError('pattern')) {
        this.errorMessage = 'First Name must contain only alphabets.';
        return;
      }
      if (lastNameControl?.hasError('pattern')) {
        this.errorMessage = 'Last Name must contain only alphabets.';
        return;
      }
      if (passwordControl?.hasError('minlength')) {
        this.errorMessage = 'Password must be at least 8 characters long.';
        return;
      }
      if (passwordControl?.hasError('pattern')) {
        this.errorMessage = 'Password must contain at least one letter, one number, and one special character.';
        return;
      }

      this.errorMessage = 'Please fill all fields correctly.';
      return;
    }
    const payload = {
      username: this.signUpForm.value.username,
      password: this.signUpForm.value.password,
      firstName: this.signUpForm.value.firstName,
      lastName: this.signUpForm.value.lastName,
      role: 'USER',
    };
    this.loader.start();
    this.api.post('auth/register', payload).subscribe({
      next: (res: any) => {
        console.log(res);
        this.loader.stop();
        this.errorMessage=res.message;
      },
      error: (err: any) => {
        this.loader.stop();
        this.errorMessage=err;
      },
    });
  }
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}
