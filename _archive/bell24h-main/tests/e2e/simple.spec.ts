import { expect, test } from '@playwright/test';

test('simple test', async ({ page, baseURL }) => {
  await page.goto(baseURL || 'http://localhost:3000');
  await expect(page).toHaveTitle(/Bell24h/);
});
