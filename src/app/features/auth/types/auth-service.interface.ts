import { Signal } from '@angular/core';

import { AuthSession } from '@admin-panel-web/features/auth/types/auth-session.interface';

import { Observable } from 'rxjs';

export interface AuthService {
  readonly session: Signal<AuthSession | null>;
  readonly isAuthenticated: Signal<boolean>;

  getAccessToken(): string | null;
  login(email: string, password: string): Observable<AuthSession>;
  logout(): void;
  restoreSession(): Observable<AuthSession | null>;
  refresh(): Observable<AuthSession | null>;
}
