import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';

@Component({
  selector: 'app-logout-page',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutPage {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);

  public constructor() {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
