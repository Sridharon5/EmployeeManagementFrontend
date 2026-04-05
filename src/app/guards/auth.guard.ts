import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.canActivateProtectedRoute$().pipe(
      take(1),
      map((ok) => {
        if (!ok) {
          void this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}
