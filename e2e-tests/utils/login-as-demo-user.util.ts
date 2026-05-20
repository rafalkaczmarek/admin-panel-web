import { Page } from '@playwright/test';

const DEFAULT_EMAIL = 'admin@dashstack.com';
const DEFAULT_PASSWORD = 'admin123';

export function getE2EUserCredentials(): { email: string; password: string } {
  return {
    email: process.env['E2E_USER_EMAIL'] ?? DEFAULT_EMAIL,
    password: process.env['E2E_USER_PASSWORD'] ?? DEFAULT_PASSWORD,
  };
}

export async function loginAsDemoUser(page: Page): Promise<void> {
  const { email, password } = getE2EUserCredentials();

  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/dashboard$/);
}
