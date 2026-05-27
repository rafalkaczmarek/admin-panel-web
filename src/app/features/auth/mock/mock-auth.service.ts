import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { INVALID_CREDENTIALS_MESSAGE } from '@admin-panel-web/features/auth/constants/auth.constants';
import { AuthSession } from '@admin-panel-web/features/auth/types/auth-session.interface';
import { AuthService } from '@admin-panel-web/features/auth/types/auth-service.interface';

import { Observable, delay, of, tap, throwError } from 'rxjs';

const STORAGE_KEY = 'app-auth-session';
const DEMO_EMAIL = 'admin@dashstack.com';
const DEMO_PASSWORD = 'admin123';
const SIMULATED_REQUEST_MS = 300;

@Injectable()
export class MockAuthService implements AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _session = signal<AuthSession | null>(this.readInitialSession());

  public readonly session = this._session.asReadonly();
  public readonly isAuthenticated = computed(() => this._session() !== null);

  public getAccessToken(): string | null {
    return null;
  }

  public login(email: string, password: string): Observable<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const isValid =
      normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD;

    if (!isValid) {
      return throwError(() => new Error(INVALID_CREDENTIALS_MESSAGE)).pipe(
        delay(SIMULATED_REQUEST_MS),
      );
    }

    const session: AuthSession = {
      email: normalizedEmail,
      loggedInAt: new Date().toISOString(),
    };

    return of(session).pipe(
      delay(SIMULATED_REQUEST_MS),
      tap((value) => this.persistSession(value)),
    );
  }

  public logout(): void {
    this.clearState();
  }

  public restoreSession(): Observable<AuthSession | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    return of(this._session());
  }

  public refresh(): Observable<AuthSession | null> {
    return of(this._session());
  }

  private clearState(): void {
    this._session.set(null);
    this.clearStoredSession();
  }

  private readInitialSession(): AuthSession | null {
    return this.readStoredSession();
  }

  private persistSession(session: AuthSession): void {
    this._session.set(session);
    this.writeStoredSession(session);
  }

  private readStoredSession(): AuthSession | null {
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

  private writeStoredSession(session: AuthSession): void {
    if (!this.isBrowser) {
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private clearStoredSession(): void {
    if (!this.isBrowser) {
      return;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}
