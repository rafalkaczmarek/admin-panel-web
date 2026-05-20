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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, type Routes } from '@angular/router';

import { authErrorInterceptor } from '@admin-panel-web/features/auth/interceptors/auth-error.interceptor';
import { SKIP_AUTH } from '@admin-panel-web/features/auth/interceptors/auth-http-context';
import { AuthService } from '@admin-panel-web/features/auth/services/auth.service';
import { unitTestApiEnvironment } from '@admin-panel-web/test/unit-test-api-environment';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { Observable, firstValueFrom, of, throwError } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class LoginRouteStub {}

const authErrorInterceptorTestRoutes: Routes = [{ path: 'login', component: LoginRouteStub }];

interface AuthMock {
  getAccessToken: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
}

function setup(opts: { refresh: () => Observable<unknown>; token?: string }): {
  authMock: AuthMock;
  http: HttpClient;
  httpController: HttpTestingController;
  router: Router;
} {
  const authMock: AuthMock = {
    getAccessToken: vi.fn(() => opts.token ?? 'access-old'),
    refresh: vi.fn(() => opts.refresh()),
    logout: vi.fn(),
  };

  TestBed.configureTestingModule({
    providers: [
      provideRouter(authErrorInterceptorTestRoutes),
      provideHttpClient(withInterceptors([authErrorInterceptor])),
      provideHttpClientTesting(),
      { provide: APP_ENVIRONMENT, useValue: unitTestApiEnvironment },
      { provide: AuthService, useValue: authMock },
    ],
  });

  return {
    authMock,
    http: TestBed.inject(HttpClient),
    httpController: TestBed.inject(HttpTestingController),
    router: TestBed.inject(Router),
  };
}

describe('authErrorInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should pass-through non-API requests unchanged', async () => {
    const { http, httpController, authMock } = setup({ refresh: () => of(null) });

    const promise = firstValueFrom(
      http.get('http://other/api/data').pipe(),
    ).catch((e: unknown) => e);

    httpController
      .expectOne('http://other/api/data')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    await promise;
    expect(authMock.refresh).not.toHaveBeenCalled();
  });

  it('should pass-through SKIP_AUTH requests without retry', async () => {
    const { http, httpController, authMock } = setup({ refresh: () => of(null) });
    const context = new HttpContext().set(SKIP_AUTH, true);

    const promise = firstValueFrom(
      http.get('http://test-api/api/auth/refresh', { context }),
    ).catch((e: unknown) => e);

    httpController
      .expectOne('http://test-api/api/auth/refresh')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    await promise;
    expect(authMock.refresh).not.toHaveBeenCalled();
  });

  it('should retry the original request once after a successful refresh', async () => {
    const { http, httpController, authMock } = setup({
      refresh: () => of(null),
      token: 'access-new',
    });

    const promise = firstValueFrom(http.get<{ ok: boolean }>('http://test-api/api/data'));

    httpController
      .expectOne('http://test-api/api/data')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    const retry = httpController.expectOne('http://test-api/api/data');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-new');
    retry.flush({ ok: true });

    const body = await promise;
    expect(body.ok).toBe(true);
    expect(authMock.refresh).toHaveBeenCalledTimes(1);
    expect(authMock.logout).not.toHaveBeenCalled();
  });

  it('should logout and redirect to /login when refresh fails', async () => {
    const { http, httpController, authMock, router } = setup({
      refresh: () => throwError(() => new Error('refresh failed')),
    });
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const promise = firstValueFrom(http.get('http://test-api/api/data')).catch(
      (e: unknown) => e,
    );

    httpController
      .expectOne('http://test-api/api/data')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    await promise;
    expect(authMock.logout).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: expect.any(String) },
    });
  });

  it('should not refresh twice for a request already marked as retried', async () => {
    const { http, httpController, authMock } = setup({ refresh: () => of(null) });

    const promise = firstValueFrom(http.get<{ ok: boolean }>('http://test-api/api/data'));

    httpController
      .expectOne('http://test-api/api/data')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    const retry = httpController.expectOne('http://test-api/api/data');
    const failed = promise.catch((e: unknown) => e);
    retry.flush(null, { status: 401, statusText: 'Unauthorized' });

    await failed;
    expect(authMock.refresh).toHaveBeenCalledTimes(1);
  });

  it('should propagate non-401 errors without refreshing', async () => {
    const { http, httpController, authMock } = setup({ refresh: () => of(null) });

    const promise = firstValueFrom(http.get('http://test-api/api/data')).catch(
      (e: unknown) => e,
    );

    httpController
      .expectOne('http://test-api/api/data')
      .flush(null, { status: 500, statusText: 'Server Error' });

    await promise;
    expect(authMock.refresh).not.toHaveBeenCalled();
  });
});
