import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://employeemanagementbackend-15.onrender.com/employees'; 

  constructor(private http: HttpClient) { }

  // Function to get Authorization headers with JWT token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken'); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  getAllEmployees(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getEmployee(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createEmployee(employee: any): Observable<any> {
    return this.http.post(this.apiUrl, employee, { headers: this.getAuthHeaders() });
  }

  updateEmployee(id: string, employee: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, employee, { headers: this.getAuthHeaders() });
  }

  deleteEmployee(employeeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${employeeId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}
