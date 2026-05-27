import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { authGuard } from '@admin-panel-web/features/auth/guards/auth.guard';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';

function createMockAuthService(authenticated: boolean) {
  const sessionSignal = signal(authenticated ? { email: 'a', loggedInAt: '' } : null);
  return {
    session: sessionSignal,
    isAuthenticated: () => authenticated,
    login: vi.fn(),
    logout: vi.fn(),
  };
}

describe('authGuard', () => {
  function setup(authenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: createMockAuthService(authenticated) },
      ],
    });
  }

  it('allows activation when authenticated', () => {
    setup(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('redirects to /login when not authenticated', () => {
    setup(false);
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
