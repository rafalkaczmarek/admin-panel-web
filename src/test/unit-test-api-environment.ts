import type { AppEnvironment } from '@admin-panel-web/types/app-environment.interface';

/** Shared fake API URL for specs that stub HTTP calls to the backend. */
export const unitTestApiEnvironment: AppEnvironment = {
  production: false,
  useMockAuth: false,
  apiBaseUrl: 'http://test-api/api',
};
