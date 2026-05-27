import { inject, Provider } from '@angular/core';

import { MockAuthService } from '@admin-panel-web/features/auth/mock/mock-auth.service';
import { HttpAuthService } from '@admin-panel-web/features/auth/services/http-auth.service';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';
import type { AuthService } from '@admin-panel-web/features/auth/services/auth.service';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

export function provideAuthService(): Provider[] {
  return [
    HttpAuthService,
    MockAuthService,
    {
      provide: AUTH_SERVICE,
      useFactory: (): AuthService => {
        const env = inject(APP_ENVIRONMENT);
        return env.useMockAuth ? inject(MockAuthService) : inject(HttpAuthService);
      },
    },
  ];
}
