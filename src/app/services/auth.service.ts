import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { ChangeDetectorRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private isAuthenticated:boolean=false;

  private role:string='';
  private jwtToken='';
  public setIsAuthenticated(value:boolean){
    this.isAuthenticated=value;
  }
  public getIsAuthenticated(){
    return this.isAuthenticated;
  }
  public setRole(value:string){
    this.role=value;
  }
  public getRole(){
    return this.role;
  }
  public setJwtToken(value:string){
    this.jwtToken=value;
  }
  public getJwtToken(){
    return this.jwtToken;
  }
  
}
