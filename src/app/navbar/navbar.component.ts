import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { routes } from '../app.routes';
import { RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports:[CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdmin = false;
  private authSubscription!: Subscription;
  private roleSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Start as false to prevent flickering issues
    this.isAuthenticated = false;
    this.isAdmin = false;
  
    this.authSubscription = this.authService.isAuthenticated$.subscribe(authStatus => {
      this.isAuthenticated = authStatus;
      console.log("Auth Status Updated:", authStatus);  // Debugging
    });
  
    this.roleSubscription = this.authService.userRole$.subscribe(role => {
      this.isAdmin = role === 'ADMIN';
      console.log("User Role Updated:", role);  // Debugging
    });
  }
  

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
  }
}
