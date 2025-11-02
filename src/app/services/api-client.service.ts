 import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

export interface RestResponse {
  status: boolean;
  data: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiClient {
  
  constructor(private http: HttpClient) {

  }
  
  getAuthUrl(url: string) {
    return this.http.get<RestResponse>(this._getAuthURL(url),{headers: { 'Content-Type': 'application/json' }});
  }
 
  public _getAuthURL(url: string) {
    return `${environment.authUrl}${url}`;
  }
  getEmployeeUrl(url: string) {
    return this.http.get<RestResponse>(this._getEmployeeURL(url),{headers: { 'Content-Type': 'application/json' }});
  }
 
  public _getEmployeeURL(url: string) {
    return `${environment.employeeUrl}${url}`;
  }
 
  post(url: string, data?: any, p0?: { headers: { 'Content-Type': string; }; responseType: string; }) {
    return this.http.post<RestResponse>(this._getAuthURL(url), data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  
}