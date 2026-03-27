import { test, expect } from './fixtures/test.fixture';

test('basic test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Bell24H/);
});
