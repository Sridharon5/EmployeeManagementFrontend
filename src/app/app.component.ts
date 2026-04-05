import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterModule, ToastModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Employee_Managements';
}
