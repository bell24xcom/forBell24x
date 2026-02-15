import { expect, test } from '@playwright/test';

test.describe('User workflows (smoke)', () => {
  test('RFQ create flow – form renders & validates', async ({ page, baseURL }) => {
    await page.goto(new URL('/rfq/create', baseURL).toString());

    // Form fields should exist (adjust selectors to your markup)
    const item = page.getByLabel(/item|product/i);
    const qty = page.getByLabel(/qty|quantity/i);
    const submit = page.getByRole('button', { name: /submit|create|send/i });

    await expect(item).toBeVisible();
    await expect(qty).toBeVisible();
    await expect(submit).toBeVisible();

    // Minimal validation smoke (no real submission if backend enforces auth)
    await submit.click();
    await expect(page.locator('text=/required|please/i')).toHaveCountGreaterThan(0);
  });

  test('Auth screens present – login & register render', async ({ page, baseURL }) => {
    await page.goto(new URL('/login', baseURL).toString());
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    await page.goto(new URL('/register', baseURL).toString());
    await expect(page.getByRole('button', { name: /sign up|register/i })).toBeVisible();
  });

  test('Supplier search page renders', async ({ page, baseURL }) => {
    await page.goto(new URL('/suppliers', baseURL).toString());
    await expect(page.locator('text=/supplier|search|filter/i')).toBeVisible();
  });
});
