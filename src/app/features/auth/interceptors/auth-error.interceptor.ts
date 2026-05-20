import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  AUTH_RETRIED,
  SKIP_AUTH,
} from '@admin-panel-web/features/auth/interceptors/auth-http-context';
import { AuthService } from '@admin-panel-web/features/auth/services/auth.service';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { catchError, switchMap, throwError } from 'rxjs';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const appEnv = inject(APP_ENVIRONMENT);
  const isApiRequest = req.url.startsWith(appEnv.apiBaseUrl);
  const isUnprotected = req.context.get(SKIP_AUTH);
  const alreadyRetried = req.context.get(AUTH_RETRIED);

  if (!isApiRequest || isUnprotected) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        alreadyRetried
      ) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap(() => {
          const retried = req.clone({
            context: req.context.set(AUTH_RETRIED, true),
            setHeaders: tokenHeader(authService),
          });
          return next(retried);
        }),
        catchError((refreshError: unknown) => {
          authService.logout();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function tokenHeader(authService: AuthService): Record<string, string> {
  const token = authService.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
