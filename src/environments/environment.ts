import type { AppEnvironment } from '@admin-panel-web/types/app-environment.interface';

export const environment: AppEnvironment = {
  production: false,
  useMockAuth: true,
  apiBaseUrl: 'http://localhost:4000/api',
};
