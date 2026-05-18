import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
}
