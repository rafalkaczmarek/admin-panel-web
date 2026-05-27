import type { AppEnvironment } from '@admin-panel-web/types/app-environment.interface';

export const environment: AppEnvironment = {
  production: false,
  useMockAuth: true,
  apiBaseUrl: 'http://127.0.0.1:3000/api',
};
