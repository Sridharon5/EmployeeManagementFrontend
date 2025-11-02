import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';
import { routes } from '../../app.routes';
import { RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports:[CommonModule,RouterModule],
  standalone:true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  isAdmin = false;


  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.isAdmin=this.authService.getRole()==='ADMIN';
  }
  
  logout() {
  this.authService.setIsAuthenticated(false);
  this.authService.setRole('');
  this.authService.setJwtToken('');
    this.router.navigate(['/login']); 
  }
}
