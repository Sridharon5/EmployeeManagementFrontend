import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../../services/api-client.service';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoginMode: boolean = false;
  registrationSuccess: boolean = false;
  errorMessage: string = '';
  signUpForm!: FormGroup;
  loginForm!:FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private api:ApiClient,
    private loader:NgxUiLoaderService
  ) {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(){
    const payload={
      username:this.loginForm.value.username,
      password:this.loginForm.value.password,
    }
    this.loader.start();
     this.api.post('login', payload).subscribe({
      next: (res: any) => {
      this.authService.setIsAuthenticated(true);
      this.authService.setJwtToken(res.token);
      this.authService.setRole(res.role);
      this.router.navigate(['dashboard']);
      this.loader.stop();
        
      },
      error: (err: any) => {
        this.loader.stop();
      },
    });
  }
  onSignUp(){
    const payload={
      username:this.signUpForm.value.username,
      password:this.signUpForm.value.password,
      firstName:this.signUpForm.value.firstName,
      lastName:this.signUpForm.value.lastName,
      role:'USER'
    }
    this.loader.start();
     this.api.post('register', payload).subscribe({
      next: (res: any) => {
      console.log(res);
      this.loader.stop();
        
      },
      error: (err: any) => {
        this.loader.stop();
      },
    });
  }
  toggleMode() {
    this.isLoginMode=!this.isLoginMode;
  }
}
