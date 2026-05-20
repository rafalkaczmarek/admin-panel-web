import { InjectionToken } from '@angular/core';

import type { AppEnvironment } from '@admin-panel-web/types/app-environment.interface';

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT');
