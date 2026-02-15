import { test, expect } from '@playwright/test';

test.describe('Bell24H Complete User Journey', () => {
  test('Complete buyer journey: register → login → dashboard → RFQ → wallet', async ({ page }) => {
    // 1. Homepage loads correctly
    await page.goto('/');
    await expect(page).toHaveTitle(/Bell24H/);
    await expect(page.locator('h1')).toContainText('The Global B2B Operating System');

    // 2. Registration flow
    await page.click('button:has-text("Register")');
    await page.fill('input[name="name"]', 'Test Buyer');
    await page.fill('input[name="email"]', 'buyer@test.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.selectOption('select[name="role"]', 'BUYER');
    await page.click('button:has-text("Create Account")');

    // 3. Dashboard access
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome');

    // 4. RFQ creation
    await page.click('button:has-text("Create RFQ")');
    await page.fill('input[name="title"]', 'Test Electronics RFQ');
    await page.fill('textarea[name="description"]', 'Need electronic components');
    await page.fill('input[name="budget"]', '50000');
    await page.click('button:has-text("Submit RFQ")');

    // 5. Wallet operations
    await page.click('a:has-text("Wallet")');
    await expect(page.locator('.wallet-balance')).toBeVisible();
    await page.click('button:has-text("Deposit")');
    await page.fill('input[name="amount"]', '10000');
    await page.click('button:has-text("Add to Wallet")');

    // 6. Search functionality
    await page.goto('/');
    await page.fill('input[placeholder*="Search"]', 'electronics');
    await page.click('button:has-text("Search")');
    await expect(page).toHaveURL(/\/search/);
  });

  test('Social login flow', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Login")');
    await page.click('button:has-text("Continue with Google")');
    // Note: In real tests, you'd mock OAuth or use test credentials
  });

  test('Supplier journey: register → profile → respond to RFQ', async ({ page }) => {
    // Supplier-specific user journey
    await page.goto('/');
    await page.click('button:has-text("Register")');
    await page.selectOption('select[name="role"]', 'SUPPLIER');
    await page.fill('input[name="name"]', 'Test Supplier');
    await page.fill('input[name="email"]', 'supplier@test.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button:has-text("Create Account")');

    // Supplier dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Browse RFQs
    await page.click('a:has-text("RFQs")');
    await expect(page.locator('.rfq-list')).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Test mobile navigation
    await page.click('button[aria-label="Menu"]');
    await expect(page.locator('.mobile-menu')).toBeVisible();

    // Test mobile forms
    await page.click('button:has-text("Register")');
    await expect(page.locator('form')).toBeVisible();
  });
});
