import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@admin-panel-web/environments/environment';
import {
  AuthService,
  INVALID_CREDENTIALS_MESSAGE,
} from '@admin-panel-web/features/auth/services/auth.service';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { firstValueFrom } from 'rxjs';

const STORAGE_KEY = 'app-auth-session';

describe('AuthService (mock mode)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: environment },
      ],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('should be created', () => {
    const service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no stored session', () => {
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
  });

  it('should restore mock session from sessionStorage on construction', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ email: 'admin@dashstack.com', loggedInAt: '2025-01-01T00:00:00Z' }),
    );

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.session()?.email).toBe('admin@dashstack.com');
  });

  it('should clear malformed stored session', () => {
    sessionStorage.setItem(STORAGE_KEY, '{not-json');

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should resolve login with valid demo credentials and persist session', async () => {
    const service = TestBed.inject(AuthService);

    const promise = firstValueFrom(service.login('admin@dashstack.com', 'admin123'));
    vi.advanceTimersByTime(400);
    const result = await promise;

    expect(result.email).toBe('admin@dashstack.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('admin@dashstack.com');
  });

  it('should reject login with invalid demo credentials and not persist', async () => {
    const service = TestBed.inject(AuthService);

    const promise = firstValueFrom(service.login('admin@dashstack.com', 'wrong-pass'));
    vi.advanceTimersByTime(400);

    await expect(promise).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should normalize email casing before validation', async () => {
    const service = TestBed.inject(AuthService);

    const promise = firstValueFrom(service.login('  ADMIN@DashStack.com ', 'admin123'));
    vi.advanceTimersByTime(400);
    const result = await promise;

    expect(result.email).toBe('admin@dashstack.com');
  });

  it('should clear session and storage on logout', async () => {
    const service = TestBed.inject(AuthService);

    const promise = firstValueFrom(service.login('admin@dashstack.com', 'admin123'));
    vi.advanceTimersByTime(400);
    await promise;

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should expose null access token in mock mode', () => {
    const service = TestBed.inject(AuthService);

    expect(service.getAccessToken()).toBeNull();
  });
});
