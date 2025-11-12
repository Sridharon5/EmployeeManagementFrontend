import { Component, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  isAdmin = false;
  role:string='';
  name:string='';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.role=this.authService.getRole();
    this.name=this.authService.getFirstName();
    
  }

  logout() {
    this.authService.setIsAuthenticated(false);
    this.authService.setRole('');
    this.authService.setJwtToken('');
    this.router.navigate(['/login']);
  }
}
