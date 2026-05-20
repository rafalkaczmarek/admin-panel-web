import { AuthUser } from '@admin-panel-web/features/auth/types/auth-user.interface';

export interface AuthLoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}
