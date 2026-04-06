import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Allows {@link Role} ADMIN and MANAGER; redirects EMPLOYEE to dashboard. */
@Injectable({
  providedIn: 'root',
})
export class ManagerOrAdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.canViewOrgStructure()) {
      return true;
    }
    void this.router.navigate(['/dashboard']);
    return false;
  }
}
