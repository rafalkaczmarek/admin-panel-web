export interface AuthSession {
  email: string;
  loggedInAt: string;
  expiresAt?: string;
  roles?: readonly string[];
}
