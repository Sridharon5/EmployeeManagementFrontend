import { Component } from '@angular/core';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login-layout',
  imports: [NgxUiLoaderModule,RouterOutlet],
  standalone:true,
   template:`
  <router-outlet></router-outlet>
  <ngx-ui-loader></ngx-ui-loader>
  `
})
export class LoginLayoutComponent {

}
