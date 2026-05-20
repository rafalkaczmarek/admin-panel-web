import { expect, test } from '@playwright/test';

import { getE2EUserCredentials } from '../utils/login-as-demo-user.util';

const { email: DEMO_EMAIL, password: DEMO_PASSWORD } = getE2EUserCredentials();

test.describe('Login', () => {
  test('redirects unauthenticated visitors from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login to Account' })).toBeVisible();
  });

  test('does not render the sidebar on the login screen', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('tree', { name: 'Main navigation menu' })).toHaveCount(0);
  });

  test('shows an alert when credentials are incorrect', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill(DEMO_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill('wrong-pass');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('alert')).toContainText('Incorrect email or password.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('signs in with valid credentials and lands on the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill(DEMO_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('treeitem', { name: 'Dashboard' })).toBeVisible();
  });

  test('logout link signs the user out and returns to /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(DEMO_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole('treeitem', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login to Account' })).toBeVisible();
  });
});
