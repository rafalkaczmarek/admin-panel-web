import { InjectionToken } from '@angular/core';

import type { AuthService } from '@admin-panel-web/features/auth/types/auth-service.interface';

export const AUTH_SERVICE = new InjectionToken<AuthService>('AuthService');
