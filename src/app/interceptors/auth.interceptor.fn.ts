import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const url = req.url;

  if (url.includes('/auth/login') || url.includes('/auth/register')) {
    const t = auth.getJwtToken();
    if (t.length > 0) {
      return next(
        req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })
      );
    }
    return next(req);
  }

  return auth.ensureValidSessionForHttp$(url).pipe(
    switchMap(() => {
      const token = auth.getJwtToken();
      const out =
        token.length > 0
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
      return next(out).pipe(
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            auth.logout();
            void router.navigate(['/login']);
          }
          return throwError(() => err);
        })
      );
    }),
    catchError(() => {
      void router.navigate(['/login']);
      return throwError(() => new Error('Session invalid'));
    })
  );
};
