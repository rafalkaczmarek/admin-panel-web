import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from '@admin-panel-web/app.routes';
import { environment } from '@admin-panel-web/environments/environment';
import { authErrorInterceptor } from '@admin-panel-web/features/auth/interceptors/auth-error.interceptor';
import { authInterceptor } from '@admin-panel-web/features/auth/interceptors/auth.interceptor';
import { provideAuthService } from '@admin-panel-web/features/auth/providers/provide-auth-service';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_ENVIRONMENT, useValue: environment },
    ...provideAuthService(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, authErrorInterceptor]),
    ),
    provideRouter(routes),
    provideAppInitializer(() => {
      const authService = inject(AUTH_SERVICE);
      return firstValueFrom(authService.restoreSession()).catch(() => null);
    }),
  ]
};
