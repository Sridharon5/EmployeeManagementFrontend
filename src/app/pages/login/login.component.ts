import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../../services/api-client.service';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { resolveApiMessage } from '../../utils/api-message.util';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, PasswordModule],
  standalone: true,
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  isLoginMode = false;
  signUpForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private api: ApiClient,
    private loader: NgxUiLoaderService,
    private messageService: MessageService
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

  ngOnInit(): void {
    if (this.authService.hasPersistedValidSession()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  private toastError(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', summary, detail, life: 6000 });
  }

  private toastSuccess(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', summary, detail, life: 4000 });
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
        this.toastError('Sign in', 'Enter your username and password.');
      } else if (!username) {
        this.toastError('Sign in', 'Username is required.');
      } else {
        this.toastError('Sign in', 'Password is required.');
      }
      return;
    }
    this.loader.start();
    this.api.post('auth/login', payload).subscribe({
      next: (res: any) => {
        this.authService.applyAuthResponse(res);
        this.loader.stop();
        this.toastSuccess('Welcome back', `Signed in as ${res.name ?? res.username ?? payload.username}.`);
        this.router.navigate(['dashboard']);
      },
      error: (err: unknown) => {
        this.loader.stop();
        const detail = resolveApiMessage(err, 'Invalid username or password.');
        this.toastError('Sign in failed', detail);
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
        this.toastError('Registration', 'Please fill in all required fields.');
        return;
      }
      if (!username) {
        this.toastError('Registration', 'Username is required.');
        return;
      }
      if (!firstName) {
        this.toastError('Registration', 'First name is required.');
        return;
      }
      if (!lastName) {
        this.toastError('Registration', 'Last name is required.');
        return;
      }
      if (!password) {
        this.toastError('Registration', 'Password is required.');
        return;
      }

      const usernameControl = this.signUpForm.get('username');
      const firstNameControl = this.signUpForm.get('firstName');
      const lastNameControl = this.signUpForm.get('lastName');
      const passwordControl = this.signUpForm.get('password');

      if (usernameControl?.hasError('minlength')) {
        this.toastError('Registration', 'Username must be at least 4 characters.');
        return;
      }
      if (usernameControl?.hasError('pattern')) {
        this.toastError(
          'Registration',
          'Username may only contain letters, numbers, and underscores.'
        );
        return;
      }
      if (firstNameControl?.hasError('pattern')) {
        this.toastError('Registration', 'First name must contain only letters.');
        return;
      }
      if (lastNameControl?.hasError('pattern')) {
        this.toastError('Registration', 'Last name must contain only letters.');
        return;
      }
      if (passwordControl?.hasError('minlength')) {
        this.toastError('Registration', 'Password must be at least 8 characters.');
        return;
      }
      if (passwordControl?.hasError('pattern')) {
        this.toastError(
          'Registration',
          'Password needs at least one letter, one number, and one special character (@$!%*?&).'
        );
        return;
      }

      this.toastError('Registration', 'Please correct the highlighted fields.');
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
        this.loader.stop();
        const msg =
          typeof res?.message === 'string' && res.message.trim()
            ? res.message.trim()
            : 'Account created. You can sign in now.';
        this.toastSuccess('Registration complete', msg);
        this.isLoginMode = true;
        this.signUpForm.reset();
      },
      error: (err: unknown) => {
        this.loader.stop();
        const detail = resolveApiMessage(err, 'Registration could not be completed.');
        this.toastError('Registration failed', detail);
      },
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.messageService.clear();
  }
}
