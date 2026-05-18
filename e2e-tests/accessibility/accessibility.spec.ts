import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../utils/expect-no-accessibility-violations.util';
import { loginAsDemoUser } from '../utils/login-as-demo-user.util';

test.describe('Accessibility', () => {
  test('login page has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login to Account' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('dashboard has no detectable accessibility violations', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });

  test('products stock page has no detectable accessibility violations', async ({ page }) => {
    await loginAsDemoUser(page);
    await page.goto('/products-stock');

    await expect(page.getByRole('heading', { name: 'Products Stock' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Products' })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
});
