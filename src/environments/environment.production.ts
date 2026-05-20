import type { AppEnvironment } from '@admin-panel-web/types/app-environment.interface';

export const environment: AppEnvironment = {
  production: true,
  useMockAuth: false,
  apiBaseUrl: 'https://api.example.com/api',
};
