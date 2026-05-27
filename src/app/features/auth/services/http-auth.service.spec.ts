import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { INVALID_CREDENTIALS_MESSAGE } from '@admin-panel-web/features/auth/constants/auth.constants';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';
import { HttpAuthService } from '@admin-panel-web/features/auth/services/http-auth.service';
import { unitTestApiEnvironment } from '@admin-panel-web/test/unit-test-api-environment';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { firstValueFrom, lastValueFrom } from 'rxjs';

const LOGIN_URL = 'http://test-api/api/auth/login';
const LOGOUT_URL = 'http://test-api/api/auth/logout';
const REFRESH_URL = 'http://test-api/api/auth/refresh';

describe('HttpAuthService', () => {
  let http: HttpTestingController;
  let service: HttpAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HttpAuthService,
        { provide: AUTH_SERVICE, useExisting: HttpAuthService },
        { provide: APP_ENVIRONMENT, useValue: unitTestApiEnvironment },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(HttpAuthService);
  });

  afterEach(() => {
    http.verify();
  });

  it('should not pre-populate session from sessionStorage', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
  });

  it('should call POST /auth/login and set session + access token', async () => {
    const promise = firstValueFrom(service.login('user@example.com', 'secret123'));

    const req = http.expectOne(LOGIN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'user@example.com', password: 'secret123' });
    expect(req.request.withCredentials).toBe(true);

    req.flush({
      accessToken: 'jwt-token-1',
      expiresAt: '2026-01-01T00:00:00Z',
      user: { email: 'user@example.com', roles: ['admin'] },
    });

    const session = await promise;
    expect(session.email).toBe('user@example.com');
    expect(session.roles).toEqual(['admin']);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('jwt-token-1');
  });

  it('should map 401 from /auth/login to invalid credentials error', async () => {
    const promise = firstValueFrom(service.login('user@example.com', 'wrong'));

    http.expectOne(LOGIN_URL).flush(
      { code: 'INVALID_CREDENTIALS', message: 'nope' },
      { status: 401, statusText: 'Unauthorized' },
    );

    await expect(promise).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should call POST /auth/logout and clear state', async () => {
    const loginPromise = firstValueFrom(service.login('user@example.com', 'secret123'));
    http.expectOne(LOGIN_URL).flush({
      accessToken: 'jwt-1',
      expiresAt: '2026-01-01T00:00:00Z',
      user: { email: 'user@example.com' },
    });
    await loginPromise;

    service.logout();

    const req = http.expectOne(LOGOUT_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
  });

  it('should clear state on logout even if backend fails', async () => {
    const loginPromise = firstValueFrom(service.login('user@example.com', 'secret123'));
    http.expectOne(LOGIN_URL).flush({
      accessToken: 'jwt-1',
      expiresAt: '2026-01-01T00:00:00Z',
      user: { email: 'user@example.com' },
    });
    await loginPromise;

    service.logout();

    http.expectOne(LOGOUT_URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
  });

  it('should refresh session via POST /auth/refresh and update token', async () => {
    const promise = lastValueFrom(service.refresh());

    const req = http.expectOne(REFRESH_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({
      accessToken: 'jwt-refreshed',
      expiresAt: '2026-02-01T00:00:00Z',
      user: { email: 'user@example.com' },
    });

    const session = await promise;
    expect(session?.email).toBe('user@example.com');
    expect(service.getAccessToken()).toBe('jwt-refreshed');
  });

  it('should clear session when refresh returns 401', async () => {
    const promise = lastValueFrom(service.refresh()).catch((e: unknown) => e);

    http.expectOne(REFRESH_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
  });

  it('should share a single in-flight refresh between concurrent callers', async () => {
    const first = lastValueFrom(service.refresh());
    const second = lastValueFrom(service.refresh());

    http.expectOne(REFRESH_URL).flush({
      accessToken: 'jwt-shared',
      expiresAt: '2026-01-01T00:00:00Z',
      user: { email: 'user@example.com' },
    });

    await first;
    await second;

    expect(service.getAccessToken()).toBe('jwt-shared');
  });

  it('restoreSession should delegate to refresh and swallow 401', async () => {
    const promise = lastValueFrom(service.restoreSession());

    http.expectOne(REFRESH_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(promise).rejects.toBeInstanceOf(Error);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login error from non-401 propagates as HttpErrorResponse wrapped', async () => {
    const promise = firstValueFrom(service.login('u@e.com', 'p')).catch((e: unknown) => e);

    http.expectOne(LOGIN_URL).flush(null, { status: 500, statusText: 'Server Error' });

    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toBe(INVALID_CREDENTIALS_MESSAGE);
    expect(error).not.toBeInstanceOf(HttpErrorResponse);
  });
});
