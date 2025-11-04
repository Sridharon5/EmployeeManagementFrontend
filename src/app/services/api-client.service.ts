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
  
  get(url: string) {
    return this.http.get<RestResponse>(this._getURL(url),{headers: { 'Content-Type': 'application/json' }});
  }
 
  public _getURL(url: string) {
    return `${environment.url}${url}`;
  }
 
  post(url: string, data?: any, p0?: { headers: { 'Content-Type': string; }; responseType: string; }) {
    return this.http.post<RestResponse>(this._getURL(url), data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  
}