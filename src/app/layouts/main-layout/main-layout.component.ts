import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [NavbarComponent, NgxUiLoaderModule, RouterOutlet],
  standalone: true,
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  displayName = '';
  displayRole = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    this.displayName = this.auth.getFirstName() || 'User';
    this.displayRole = this.auth.getRole() || '—';
  }

  get pageTitle(): string {
    const path = this.router.url.split('?')[0];
    const segment = path.split('/').filter(Boolean).pop() || 'dashboard';
    if (segment === 'tasks' && !this.auth.canManageTasks()) {
      return 'My tasks';
    }
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      departments: 'Departments',
      designation: 'Designations',
      employee: 'Employees',
      tasks: 'Tasks',
    };
    return titles[segment] ?? 'Overview';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  onUserActivity(): void {
    this.auth.touchActivityThrottled();
  }
}
