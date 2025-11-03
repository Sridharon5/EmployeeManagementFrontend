import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private role = '';
  private jwtToken = '';

  constructor() {
    // Load from localStorage when service is created
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('jwtToken');

    this.isAuthenticated = storedAuth === 'true';
    this.role = storedRole || '';
    this.jwtToken = storedToken || '';
  }

  setIsAuthenticated(value: boolean) {
    this.isAuthenticated = value;
    localStorage.setItem('isAuthenticated', String(value));
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  setRole(value: string) {
    this.role = value;
    localStorage.setItem('role', value);
  }

  getRole(): string {
    return this.role;
  }

  setJwtToken(value: string) {
    this.jwtToken = value;
    localStorage.setItem('jwtToken', value);
  }

  getJwtToken(): string {
    return this.jwtToken;
  }

  logout() {
    this.isAuthenticated = false;
    this.role = '';
    this.jwtToken = '';
    localStorage.clear();
  }
}
