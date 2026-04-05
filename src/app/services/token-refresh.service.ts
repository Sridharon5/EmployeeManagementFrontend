import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Login / refresh response shape from backend */
export interface AuthTokenResponse {
  token: string;
  role?: string;
  name?: string;
  userId?: number;
  username?: string;
}

/**
 * Calls {@code POST /auth/refresh} without going through {@link HttpInterceptorFn}s
 * (avoids circular refresh logic).
 */
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly http: HttpClient;

  constructor() {
    this.http = new HttpClient(inject(HttpBackend));
  }

  postRefresh(token: string): Observable<AuthTokenResponse> {
    const base = environment.url.replace(/\/?$/, '/');
    return this.http.post<AuthTokenResponse>(`${base}auth/refresh`, {}, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    });
  }
}
