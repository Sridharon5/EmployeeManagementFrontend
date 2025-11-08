import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DepartmentsComponent } from './pages/departments/departments.component';
import { DesignationComponent } from './pages/designation/designation.component';
import { EmployeeComponent } from './pages/employee/employee.component';

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
        path: 'employee',
        component: EmployeeComponent /*, canActivate: [AuthGuard] */,
      },
      {
        path: 'dashboard',
        component: DashboardComponent /*, canActivate: [AuthGuard] */,
      },
      {
        path: 'departments',
        component: DepartmentsComponent /*, canActivate: [AuthGuard] */,
      },
      {
        path: 'designation',
        component: DesignationComponent /*, canActivate: [AuthGuard] */,
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
