import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { INVALID_CREDENTIALS_MESSAGE } from '@admin-panel-web/features/auth/constants/auth.constants';
import { MockAuthService } from '@admin-panel-web/features/auth/mock/mock-auth.service';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';

import { firstValueFrom } from 'rxjs';

const STORAGE_KEY = 'app-auth-session';

describe('MockAuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        MockAuthService,
        { provide: AUTH_SERVICE, useExisting: MockAuthService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('should be created', () => {
    const service = TestBed.inject(MockAuthService);
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when no stored session', () => {
    const service = TestBed.inject(MockAuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
  });

  it('should restore session from sessionStorage on construction', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ email: 'admin@dashstack.com', loggedInAt: '2025-01-01T00:00:00Z' }),
    );

    const service = TestBed.inject(MockAuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.session()?.email).toBe('admin@dashstack.com');
  });

  it('should clear malformed stored session', () => {
    sessionStorage.setItem(STORAGE_KEY, '{not-json');

    const service = TestBed.inject(MockAuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should resolve login with valid demo credentials and persist session', async () => {
    const service = TestBed.inject(MockAuthService);

    const promise = firstValueFrom(service.login('admin@dashstack.com', 'admin123'));
    await vi.advanceTimersByTimeAsync(400);
    const result = await promise;

    expect(result.email).toBe('admin@dashstack.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('admin@dashstack.com');
  });

  it('should reject login with invalid demo credentials and not persist', async () => {
    const service = TestBed.inject(MockAuthService);

    const promise = firstValueFrom(service.login('admin@dashstack.com', 'wrong-pass'));
    const assertion = expect(promise).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE);
    await vi.advanceTimersByTimeAsync(400);
    await assertion;
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should normalize email casing before validation', async () => {
    const service = TestBed.inject(MockAuthService);

    const promise = firstValueFrom(service.login('  ADMIN@DashStack.com ', 'admin123'));
    await vi.advanceTimersByTimeAsync(400);
    const result = await promise;

    expect(result.email).toBe('admin@dashstack.com');
  });

  it('should clear session and storage on logout', async () => {
    const service = TestBed.inject(MockAuthService);

    const promise = firstValueFrom(service.login('admin@dashstack.com', 'admin123'));
    await vi.advanceTimersByTimeAsync(400);
    await promise;

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should expose null access token', () => {
    const service = TestBed.inject(MockAuthService);

    expect(service.getAccessToken()).toBeNull();
  });
});
