import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { UpdateEmployeeComponent } from './update-employee/update-employee.component';
import { DetailsComponent } from './details/details.component';
import { LoginComponent } from './login/login.component';
import { UserRegistrationComponent } from './register/register.component';
import { DefaultComponent } from './default/default.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [  
  { path: 'employee-list', component: EmployeeListComponent /*, canActivate: [AuthGuard] */},  
  { path: 'add-employee', component: AddEmployeeComponent /*, canActivate: [AuthGuard, AdminGuard] */},  
  { path: 'details/:id', component: DetailsComponent /*//, canActivate: [AuthGuard]*/ },  
  { path: 'update-employee/:id', component: UpdateEmployeeComponent /*, canActivate: [AuthGuard, AdminGuard] */},  
  { path: 'login', component: LoginComponent },  
  { path: 'register', component: UserRegistrationComponent },  
  { path: 'default', component: DefaultComponent },  
  { path: '', redirectTo: 'default', pathMatch: 'full' },  
  { path: '**', redirectTo: 'default' } 
];
