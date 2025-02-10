import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { EmployeeService } from './services/employee.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';  

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  
    importProvidersFrom(HttpClientModule),  
    EmployeeService,  
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    } 
  ],
};
