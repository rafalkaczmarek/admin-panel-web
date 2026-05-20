import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { SKIP_AUTH } from '@admin-panel-web/features/auth/interceptors/auth-http-context';
import { AuthService } from '@admin-panel-web/features/auth/services/auth.service';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const appEnv = inject(APP_ENVIRONMENT);
  if (!req.url.startsWith(appEnv.apiBaseUrl)) {
    return next(req);
  }

  if (req.context.get(SKIP_AUTH)) {
    return next(req.clone({ withCredentials: true }));
  }

  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const headers = token
    ? req.headers.set('Authorization', `Bearer ${token}`)
    : req.headers;

  return next(req.clone({ headers, withCredentials: true }));
};
