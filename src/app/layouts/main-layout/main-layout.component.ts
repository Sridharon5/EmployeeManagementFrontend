import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import {NgxUiLoaderModule} from 'ngx-ui-loader';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-main-layout',
  imports: [NavbarComponent,NgxUiLoaderModule,RouterOutlet],
  standalone:true,
  template: `
    <div class="main-layout">
      <app-navbar class="sidebar"></app-navbar>
      <div class="content-area">
      <router-outlet></router-outlet>
      </div>
    </div>
    <ngx-ui-loader></ngx-ui-loader>
  `,
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {

}
