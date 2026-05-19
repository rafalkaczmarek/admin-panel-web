import { expect, test, type Locator, type Page } from '@playwright/test';

import { loginAsDemoUser } from '../utils/login-as-demo-user.util';

async function waitForFavouritesGridLoaded(page: Page): Promise<Locator> {
  const grid = page.getByRole('region', { name: 'Favourite products' });
  await expect(grid).toBeVisible();
  await expect(grid.getByRole('article').first()).toBeVisible();
  return grid;
}

test.describe('Favourites', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await loginAsDemoUser(page);
  });

  test('navigates to favourites page from sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('treeitem', { name: 'Favourites' }).click();

    await expect(page).toHaveURL(/\/favourites$/);
    await expect(page.getByRole('heading', { name: 'Favourites' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Favourite products' })).toBeVisible();
  });

  test('shows favourite product cards with rating and price', async ({ page }) => {
    await page.goto('/favourites');
    const grid = await waitForFavouritesGridLoaded(page);

    const firstCard = grid.getByRole('article').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByRole('img', { name: /out of 5 stars/ })).toBeVisible();
    await expect(firstCard.getByRole('button', { name: /Add .* to cart/ })).toBeVisible();
  });

  test('filters favourites using the search field', async ({ page }) => {
    await page.goto('/favourites');
    await waitForFavouritesGridLoaded(page);

    await page
      .getByRole('searchbox', { name: 'Search favourites by name, description or category' })
      .fill('apple');

    await expect(
      page.getByRole('heading', { name: 'Apple Watch Series 7' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Samsung Galaxy A50' }),
    ).toHaveCount(0);
  });

  test('filters favourites by category', async ({ page }) => {
    await page.goto('/favourites');
    await waitForFavouritesGridLoaded(page);

    await page.getByRole('combobox', { name: 'Filter favourites by category' }).click();
    await page.getByRole('option', { name: 'Fashion' }).click();

    await expect(page.getByRole('heading', { name: "Women's Casual Wear" })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Apple Watch Series 7' }),
    ).toHaveCount(0);
  });

  test('sorts favourites by price ascending', async ({ page }) => {
    await page.goto('/favourites');
    const grid = await waitForFavouritesGridLoaded(page);

    await page.getByRole('combobox', { name: 'Sort favourites' }).click();
    await page.getByRole('option', { name: 'Price (low to high)' }).click();

    const firstCardHeading = grid.getByRole('article').first().getByRole('heading');
    await expect(firstCardHeading).toHaveText('Ceramic Coffee Mug Set');
  });

  test('removes a favourite by clicking the heart toggle', async ({ page }) => {
    await page.goto('/favourites');
    const grid = await waitForFavouritesGridLoaded(page);

    const heartButton = grid.getByRole('button', {
      name: 'Remove Apple Watch Series 7 from favourites',
    });
    await heartButton.click();

    await expect(
      page.getByRole('heading', { name: 'Apple Watch Series 7' }),
    ).toHaveCount(0);
  });
});
