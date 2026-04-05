import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClient } from '../../services/api-client.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { resolveApiMessage } from '../../utils/api-message.util';
import { AuthService } from '../../services/auth.service';
import { UserDashboardDto } from '../../models/task-dashboard.models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: any[] = [];
  userDash: UserDashboardDto | null = null;

  constructor(
    private api: ApiClient,
    private loader: NgxUiLoaderService,
    private messageService: MessageService,
    readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.getKeyPointIndicators();
    } else {
      this.loadUserDashboard();
    }
  }

  getKeyPointIndicators(): void {
    this.loader.start();
    this.api.get('auth/getKeyPointIndicators').subscribe({
      next: (res: unknown) => {
        const r = res as Record<string, unknown>;
        this.stats = (Array.isArray(r) ? r : r['data'] ?? r) as any[];
        this.loader.stop();
      },
      error: (err: unknown) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'Dashboard',
          detail: resolveApiMessage(err, 'Could not load dashboard metrics.'),
        });
      },
    });
  }

  loadUserDashboard(): void {
    this.loader.start();
    this.api.get('dashboard/me').subscribe({
      next: (res: unknown) => {
        const r = res as Record<string, unknown>;
        const body = (r['data'] ?? r) as UserDashboardDto;
        this.userDash = {
          openTaskCount: Number(body?.openTaskCount ?? 0),
          dueWithinSevenDaysCount: Number(body?.dueWithinSevenDaysCount ?? 0),
          recentlyClosedTasks: Array.isArray(body?.recentlyClosedTasks)
            ? body.recentlyClosedTasks
            : [],
        };
        this.loader.stop();
      },
      error: (err: unknown) => {
        this.loader.stop();
        this.messageService.add({
          severity: 'error',
          summary: 'My dashboard',
          detail: resolveApiMessage(err, 'Could not load your dashboard.'),
        });
      },
    });
  }
}
