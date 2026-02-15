import { expect, test } from '@playwright/test';

test.describe('BELL24H Basic Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/BELL24H/);

    // Check main logo is visible
    await expect(page.locator('[data-testid="bell24h-logo"]')).toBeVisible();

    // Check main heading
    await expect(page.locator('h1')).toContainText('Unified B2B Marketplace');
  });

  test('should display navigation elements', async ({ page }) => {
    // Check desktop navigation
    await expect(page.locator('[data-testid="marketplace-link"]')).toBeVisible();

    // Check mobile navigation (should be visible on mobile)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-marketplace-link"]')).toBeVisible();
  });

  test('should display live statistics', async ({ page }) => {
    // Check that stats are displayed
    await expect(page.locator('text=Verified Suppliers')).toBeVisible();
    await expect(page.locator('text=Active Buyers')).toBeVisible();
    await expect(page.locator('text=Daily RFQs')).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    // Check search input is present
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

    // Check category select is present
    await expect(page.locator('[data-testid="category-select"]')).toBeVisible();

    // Check search button is present
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
  });

  test('should display categories section', async ({ page }) => {
    // Scroll to categories section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    // Check categories are displayed
    await expect(page.locator('[data-testid="category-card"]')).toBeVisible();

    // Check view all categories button
    await expect(page.locator('[data-testid="view-all-categories"]')).toBeVisible();
  });

  test('should have working CTAs', async ({ page }) => {
    // Check main CTA buttons
    await expect(page.locator('text=Start Free Trial')).toBeVisible();
    await expect(page.locator('text=Watch Demo')).toBeVisible();
  });

  test('should display footer content', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer sections
    await expect(page.locator('text=About BELL24H')).toBeVisible();
    await expect(page.locator('text=Contact Us')).toBeVisible();
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
    await expect(page.locator('text=Terms of Service')).toBeVisible();
  });

  test('should have mobile responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-marketplace-link"]')).toBeVisible();

    // Check mobile CTA is visible
    await expect(page.locator('[data-testid="mobile-cta"]')).toBeVisible();
  });

  test('should have voice RFQ functionality', async ({ page }) => {
    // Check voice RFQ button is present
    await expect(page.locator('[data-testid="mobile-voice-cta"]')).toBeVisible();
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (generous for development)
    expect(loadTime).toBeLessThan(10000);
    console.log(`Homepage loaded in ${loadTime}ms`);
  });
});
