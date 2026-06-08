import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { AUTH_SERVICE } from '@admin-panel-web/features/auth/tokens/auth-service.token';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-page',
  imports: [
    FormField,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly headingId = 'login-heading';
  protected readonly errorId = 'login-error';

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly passwordVisible = signal(false);

  protected readonly loginModel = signal({
    email: '',
    password: '',
    rememberMe: false,
  });

  protected readonly loginForm = form(this.loginModel, (path) => {
    required(path.email, { message: 'Email is required.' });
    email(path.email, { message: 'Enter a valid email address.' });
    required(path.password, { message: 'Password is required.' });
    minLength(path.password, 6, { message: 'Password must be at least 6 characters.' });
  });

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected onSubmit(): void {
    void submit(this.loginForm, {
      action: async () => {
        this.errorMessage.set(null);
        const { email: emailValue, password } = this.loginModel();

        try {
          await firstValueFrom(this.authService.login(emailValue, password));
          const returnUrl = this.resolveReturnUrl();
          await this.router.navigateByUrl(returnUrl);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unable to sign in.';
          this.errorMessage.set(message);
        }
      },
    });
  }

  private resolveReturnUrl(): string {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
      return raw;
    }
    return '/dashboard';
  }
}
