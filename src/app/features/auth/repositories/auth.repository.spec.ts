import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SKIP_AUTH } from '@admin-panel-web/features/auth/interceptors/auth-http-context';
import { AuthRepository } from '@admin-panel-web/features/auth/repositories/auth.repository';
import { unitTestApiEnvironment } from '@admin-panel-web/test/unit-test-api-environment';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { firstValueFrom } from 'rxjs';

describe('AuthRepository', () => {
  let http: HttpTestingController;
  let repo: AuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: unitTestApiEnvironment },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    repo = TestBed.inject(AuthRepository);
  });

  afterEach(() => {
    http.verify();
  });

  it('login should POST credentials with withCredentials and SKIP_AUTH context', async () => {
    const promise = firstValueFrom(
      repo.login({ email: 'a@b.com', password: 'p', rememberMe: true }),
    );

    const req = http.expectOne('http://test-api/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'a@b.com', password: 'p', rememberMe: true });
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.context.get(SKIP_AUTH)).toBe(true);

    req.flush({
      accessToken: 't',
      expiresAt: '2026-01-01T00:00:00Z',
      user: { email: 'a@b.com' },
    });

    const response = await promise;
    expect(response.accessToken).toBe('t');
  });

  it('logout should POST empty body with credentials', async () => {
    const promise = firstValueFrom(repo.logout());

    const req = http.expectOne('http://test-api/api/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.context.get(SKIP_AUTH)).toBe(false);
    req.flush(null);

    await promise;
  });

  it('refresh should POST with credentials and SKIP_AUTH context', async () => {
    const promise = firstValueFrom(repo.refresh());

    const req = http.expectOne('http://test-api/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.context.get(SKIP_AUTH)).toBe(true);

    req.flush({
      accessToken: 'refreshed',
      expiresAt: '2026-02-01T00:00:00Z',
      user: { email: 'a@b.com' },
    });

    const response = await promise;
    expect(response.accessToken).toBe('refreshed');
  });
});
