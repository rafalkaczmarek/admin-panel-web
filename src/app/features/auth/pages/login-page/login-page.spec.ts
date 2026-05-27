import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { LoginPage } from '@admin-panel-web/features/auth/pages/login-page/login-page';
import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';
import { AuthSession } from '@admin-panel-web/features/auth/types/auth-session.interface';

import { of, throwError } from 'rxjs';

function createMockAuthService() {
  return {
    isAuthenticated: () => false,
    session: () => null,
    login: vi.fn(),
    logout: vi.fn(),
  };
}

function activatedRouteWith(returnUrl: string | null) {
  return {
    snapshot: {
      queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
    },
  };
}

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let el: HTMLElement;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;

  async function configure(returnUrl: string | null = null) {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: activatedRouteWith(returnUrl) },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateByUrlSpy = vi.fn().mockResolvedValue(true);
    router.navigateByUrl = navigateByUrlSpy as unknown as typeof router.navigateByUrl;

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement;
  }

  it('should create', async () => {
    await configure();
    expect(component).toBeTruthy();
  });

  it('should render the Figma heading and submit button', async () => {
    await configure();
    expect(el.querySelector('h1')?.textContent).toContain('Login to Account');
    expect(el.querySelector('button[type="submit"]')?.textContent).toContain('Sign In');
  });

  it('should not call AuthService.login when form is invalid', async () => {
    await configure();
    component['onSubmit']();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should navigate to /dashboard when no returnUrl is provided', async () => {
    await configure();
    const session: AuthSession = { email: 'a@b.com', loggedInAt: '' };
    mockAuthService.login.mockReturnValue(of(session));

    component['form'].setValue({ email: 'a@b.com', password: 'admin123', rememberMe: false });
    component['onSubmit']();
    fixture.detectChanges();

    expect(mockAuthService.login).toHaveBeenCalledWith('a@b.com', 'admin123');
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('should respect a relative returnUrl query parameter', async () => {
    await configure('/favourites?sort=name');
    const session: AuthSession = { email: 'a@b.com', loggedInAt: '' };
    mockAuthService.login.mockReturnValue(of(session));

    component['form'].setValue({ email: 'a@b.com', password: 'admin123', rememberMe: false });
    component['onSubmit']();
    fixture.detectChanges();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/favourites?sort=name');
  });

  it('should ignore protocol-relative returnUrl and fall back to /dashboard', async () => {
    await configure('//evil.example.com/steal');
    const session: AuthSession = { email: 'a@b.com', loggedInAt: '' };
    mockAuthService.login.mockReturnValue(of(session));

    component['form'].setValue({ email: 'a@b.com', password: 'admin123', rememberMe: false });
    component['onSubmit']();
    fixture.detectChanges();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('should render an alert with error message on failed login', async () => {
    await configure();
    mockAuthService.login.mockReturnValue(
      throwError(() => new Error('Incorrect email or password.')),
    );

    component['form'].setValue({ email: 'a@b.com', password: 'wrong-pass', rememberMe: false });
    component['onSubmit']();
    fixture.detectChanges();

    const alert = el.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Incorrect email or password.');
  });

  it('should toggle password visibility', async () => {
    await configure();
    const toggle = el.querySelector('.password-toggle') as HTMLButtonElement;
    const passwordInput = el.querySelector(
      'input[autocomplete="current-password"]',
    ) as HTMLInputElement;

    expect(passwordInput.type).toBe('password');

    toggle.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
  });
});
