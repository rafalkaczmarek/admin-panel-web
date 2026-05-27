import {
  HttpClient,
  HttpContext,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SKIP_AUTH } from '@admin-panel-web/features/auth/interceptors/auth-http-context';
import { authInterceptor } from '@admin-panel-web/features/auth/interceptors/auth.interceptor';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';
import { unitTestApiEnvironment } from '@admin-panel-web/test/unit-test-api-environment';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { firstValueFrom } from 'rxjs';

function setup(token: string | null) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      { provide: APP_ENVIRONMENT, useValue: unitTestApiEnvironment },
      { provide: AUTH_SERVICE, useValue: { getAccessToken: () => token } },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpController: TestBed.inject(HttpTestingController),
  };
}

describe('authInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should not touch requests outside apiBaseUrl', async () => {
    const { http, httpController } = setup('token-1');

    const promise = firstValueFrom(http.get('http://other-host/api/users'));

    const req = httpController.expectOne('http://other-host/api/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
    await promise;
  });

  it('should attach Authorization and withCredentials for API requests', async () => {
    const { http, httpController } = setup('token-1');

    const promise = firstValueFrom(http.get('http://test-api/api/users'));

    const req = httpController.expectOne('http://test-api/api/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
    await promise;
  });

  it('should omit Authorization when SKIP_AUTH context is set but keep withCredentials', async () => {
    const { http, httpController } = setup('token-1');
    const context = new HttpContext().set(SKIP_AUTH, true);

    const promise = firstValueFrom(
      http.post('http://test-api/api/auth/refresh', {}, { context }),
    );

    const req = httpController.expectOne('http://test-api/api/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
    await promise;
  });

  it('should not attach Authorization when token is null', async () => {
    const { http, httpController } = setup(null);

    const promise = firstValueFrom(http.get('http://test-api/api/users'));

    const req = httpController.expectOne('http://test-api/api/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
    await promise;
  });
});
