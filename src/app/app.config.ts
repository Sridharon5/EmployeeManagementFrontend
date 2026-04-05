import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { authInterceptorFn } from './interceptors/auth.interceptor.fn';

export const appConfig: ApplicationConfig = {
  providers: [
    // Theme preset supplies CSS variables (dt(...) tokens) for overlays, inputs, etc.
    // Without it, p-select panels are effectively transparent and break inside dialogs.
    providePrimeNG({
      theme: {
        preset: Aura,
      },
      overlayAppendTo: 'body',
      zIndex: {
        modal: 1100,
        overlay: 1200,
        menu: 1200,
        tooltip: 1200,
      },
    }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'dd-MMM-yyyy' },
    },
    MessageService,
  ],
};
