import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { ChangeDetectorRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://employeemanagementbackend-15.onrender.com/auth';

  private isAuthenticatedSubject!: BehaviorSubject<boolean>;
  isAuthenticated$!: Observable<boolean>;

  private userRoleSubject!: BehaviorSubject<string | null>;
  userRole$!: Observable<string | null>;

  constructor(private http: HttpClient) {
    // Always start as false and update after checking localStorage
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
    this.userRoleSubject = new BehaviorSubject<string | null>(null);
    this.userRole$ = this.userRoleSubject.asObservable();
  
    // Now check localStorage and update correctly
    if (this.isAuthenticated()) {
      this.isAuthenticatedSubject.next(true);
    }
    if (this.getUserRole()) {
      this.userRoleSubject.next(this.getUserRole());
    }
  }
  

  register(user: User): Observable<string> { 
    return this.http.post<string>(`${this.apiUrl}/register`, user, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'text' as 'json' 
    });
  }

  login(username: string, password: string): Observable<{ token: string, role: string }> {
    return this.http.post<{ token: string, role: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('jwtToken', response.token);
          localStorage.setItem('userRole', response.role);

          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(response.role);
        })
      );
  }

  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');

    // ✅ Update BehaviorSubjects after logout
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }
}
