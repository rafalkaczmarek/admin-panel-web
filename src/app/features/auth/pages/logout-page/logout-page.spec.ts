import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LogoutPage } from '@admin-panel-web/features/auth/pages/logout-page/logout-page';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';

describe('LogoutPage', () => {
  let mockAuthService: { logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LogoutPage }]),
        { provide: AUTH_SERVICE, useValue: mockAuthService },
      ],
    });
  });

  it('calls AuthService.logout and navigates to /login', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    TestBed.createComponent(LogoutPage);

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
