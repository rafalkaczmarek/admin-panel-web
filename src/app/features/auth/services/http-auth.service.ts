import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

import { INVALID_CREDENTIALS_MESSAGE } from '@admin-panel-web/features/auth/constants/auth.constants';
import { AuthRepository } from '@admin-panel-web/features/auth/repositories/auth.repository';
import { AuthLoginResponse } from '@admin-panel-web/features/auth/types/auth-login-response.interface';
import { AuthService } from '@admin-panel-web/features/auth/types/auth-service.interface';
import { AuthSession } from '@admin-panel-web/features/auth/types/auth-session.interface';

import {
  EMPTY,
  Observable,
  catchError,
  map,
  of,
  shareReplay,
  throwError,
} from 'rxjs';

@Injectable()
export class HttpAuthService implements AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly repo = inject(AuthRepository);

  private readonly _session = signal<AuthSession | null>(null);

  private accessToken: string | null = null;
  private refreshInFlight: Observable<AuthSession | null> | null = null;

  public readonly session = this._session.asReadonly();
  public readonly isAuthenticated = computed(() => this._session() !== null);

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public login(email: string, password: string): Observable<AuthSession> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.repo.login({ email: normalizedEmail, password }).pipe(
      map((response) => this.applyLoginResponse(response, normalizedEmail)),
      catchError((error: unknown) =>
        throwError(() => this.toLoginError(error)),
      ),
    );
  }

  public logout(): void {
    this.repo.logout().pipe(catchError(() => EMPTY)).subscribe();
    this.clearState();
  }

  public restoreSession(): Observable<AuthSession | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    return this.refresh();
  }

  public refresh(): Observable<AuthSession | null> {
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

  private clearState(): void {
    this.accessToken = null;
    this._session.set(null);
  }
}
