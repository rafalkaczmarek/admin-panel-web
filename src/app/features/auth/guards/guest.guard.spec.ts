import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';

import { guestGuard } from '@admin-panel-web/features/auth/guards/guest.guard';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';

function createMockAuthService(authenticated: boolean) {
  return {
    isAuthenticated: () => authenticated,
    session: () => (authenticated ? { email: 'a', loggedInAt: '' } : null),
    login: vi.fn(),
    logout: vi.fn(),
  };
}

describe('guestGuard', () => {
  function setup(authenticated: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: createMockAuthService(authenticated) },
      ],
    });
  }

  it('allows activation when not authenticated', () => {
    setup(false);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('redirects to /dashboard when already authenticated', () => {
    setup(true);
    const router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });
});
