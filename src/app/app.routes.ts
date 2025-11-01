import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { AddEmployeeComponent } from './pages/add-employee/add-employee.component';
import { UpdateEmployeeComponent } from './pages/update-employee/update-employee.component';
import { DetailsComponent } from './pages/details/details.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [{ path: 'login', component: LoginComponent }],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'employee-list',
        component: EmployeeListComponent /*, canActivate: [AuthGuard] */,
      },
      {
        path: 'add-employee',
        component:
          AddEmployeeComponent /*, canActivate: [AuthGuard, AdminGuard] */,
      },
      {
        path: 'details/:id',
        component: DetailsComponent /*//, canActivate: [AuthGuard]*/,
      },
      {
        path: 'update-employee/:id',
        component:
          UpdateEmployeeComponent /*, canActivate: [AuthGuard, AdminGuard] */,
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
