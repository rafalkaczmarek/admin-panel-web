import type { AppEnvironment } from '@admin-panel-web/types/app-environment.interface';

export const environment: AppEnvironment = {
  production: false,
  useMockAuth: false,
  apiBaseUrl: 'http://localhost:3000/api',
};
