import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { AuthRepository } from '@admin-panel-web/features/auth/services/auth.repository';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';
import { AuthLoginResponse } from '@admin-panel-web/features/auth/types/auth-login-response.interface';
import { AuthSession } from '@admin-panel-web/features/auth/types/auth-session.interface';

import {
  EMPTY,
  Observable,
  catchError,
  delay,
  map,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';

const STORAGE_KEY = 'app-auth-session';
const DEMO_EMAIL = 'admin@dashstack.com';
const DEMO_PASSWORD = 'admin123';
const SIMULATED_REQUEST_MS = 300;

export const INVALID_CREDENTIALS_MESSAGE = 'Incorrect email or password.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly repo = inject(AuthRepository);
  private readonly env = inject(APP_ENVIRONMENT);

  private readonly _session = signal<AuthSession | null>(this.readInitialSession());

  private accessToken: string | null = null;
  private refreshInFlight: Observable<AuthSession | null> | null = null;

  public readonly session = this._session.asReadonly();
  public readonly isAuthenticated = computed(() => this._session() !== null);

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public login(email: string, password: string): Observable<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();

    if (this.env.useMockAuth) {
      return this.mockLogin(normalizedEmail, password);
    }

    return this.repo.login({ email: normalizedEmail, password }).pipe(
      map((response) => this.applyLoginResponse(response, normalizedEmail)),
      catchError((error: unknown) =>
        throwError(() => this.toLoginError(error)),
      ),
    );
  }

  public logout(): void {
    if (!this.env.useMockAuth) {
      this.repo.logout().pipe(catchError(() => EMPTY)).subscribe();
    }
    this.clearState();
  }

  public restoreSession(): Observable<AuthSession | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    if (this.env.useMockAuth) {
      return of(this._session());
    }

    return this.refresh();
  }

  public refresh(): Observable<AuthSession | null> {
    if (this.env.useMockAuth) {
      return of(this._session());
    }

    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.repo.refresh().pipe(
      map((response) => this.applyLoginResponse(response)),
      catchError(() => {
        this.clearState();
        return throwError(() => new Error('Session expired.'));
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.refreshInFlight.subscribe({
      complete: () => {
        this.refreshInFlight = null;
      },
      error: () => {
        this.refreshInFlight = null;
      },
    });

    return this.refreshInFlight;
  }

  private applyLoginResponse(
    response: AuthLoginResponse,
    fallbackEmail?: string,
  ): AuthSession {
    this.accessToken = response.accessToken;

    const session: AuthSession = {
      email: response.user.email ?? fallbackEmail ?? '',
      loggedInAt: new Date().toISOString(),
      expiresAt: response.expiresAt,
      roles: response.user.roles,
    };

    this._session.set(session);
    return session;
  }

  private toLoginError(error: unknown): Error {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return new Error(INVALID_CREDENTIALS_MESSAGE);
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unable to sign in.');
  }

  private mockLogin(email: string, password: string): Observable<AuthSession> {
    const isValid = email === DEMO_EMAIL && password === DEMO_PASSWORD;

    if (!isValid) {
      return throwError(() => new Error(INVALID_CREDENTIALS_MESSAGE)).pipe(
        delay(SIMULATED_REQUEST_MS),
      );
    }

    const session: AuthSession = {
      email,
      loggedInAt: new Date().toISOString(),
    };

    return of(session).pipe(
      delay(SIMULATED_REQUEST_MS),
      tap((value) => this.persistMockSession(value)),
    );
  }

  private clearState(): void {
    this.accessToken = null;
    this._session.set(null);
    this.clearStoredMockSession();
  }

  private readInitialSession(): AuthSession | null {
    if (!this.env.useMockAuth) {
      return null;
    }
    return this.readStoredMockSession();
  }

  private persistMockSession(session: AuthSession): void {
    this._session.set(session);
    this.writeStoredMockSession(session);
  }

  private readStoredMockSession(): AuthSession | null {
    if (!this.isBrowser) {
      return null;
    }
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private writeStoredMockSession(session: AuthSession): void {
    if (!this.isBrowser) {
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private clearStoredMockSession(): void {
    if (!this.isBrowser) {
      return;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}
