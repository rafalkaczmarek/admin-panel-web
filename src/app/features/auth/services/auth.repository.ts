import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { SKIP_AUTH } from '@admin-panel-web/features/auth/interceptors/auth-http-context';
import { AuthLoginRequest } from '@admin-panel-web/features/auth/types/auth-login-request.interface';
import { AuthLoginResponse } from '@admin-panel-web/features/auth/types/auth-login-response.interface';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly env = inject(APP_ENVIRONMENT);
  private readonly baseUrl = `${this.env.apiBaseUrl}/auth`;

  public login(body: AuthLoginRequest): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.baseUrl}/login`, body, {
      withCredentials: true,
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  public refresh(): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(
      `${this.baseUrl}/refresh`,
      {},
      {
        withCredentials: true,
        context: new HttpContext().set(SKIP_AUTH, true),
      },
    );
  }
}
