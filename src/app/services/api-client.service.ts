import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface RestResponse {
  status: boolean;
  data: any;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private jsonHeaders(): HttpHeaders {
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = (this.auth.getJwtToken() ?? '').trim();
    if (token.length > 0) {
      h = h.set('Authorization', `Bearer ${token}`);
    }
    return h;
  }

  get(url: string, options?: { params?: HttpParams }): Observable<unknown> {
    return this.http.get(this._getURL(url), {
      headers: this.jsonHeaders(),
      ...options,
    });
  }

  _getURL(url: string): string {
    const base = environment.url.replace(/\/?$/, '/');
    const path = url.replace(/^\//, '');
    return `${base}${path}`;
  }

  post(url: string, data?: unknown): Observable<unknown> {
    return this.http.post(this._getURL(url), data, {
      headers: this.jsonHeaders(),
    });
  }

  patch(url: string, data?: unknown): Observable<unknown> {
    return this.http.patch(this._getURL(url), data, {
      headers: this.jsonHeaders(),
    });
  }
}