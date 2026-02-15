import { expect, test } from '@playwright/test';

test.describe('BELL24H Practical Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/BELL24H/);
    
    // Check main logo is visible
    await expect(page.locator('text=BELL24H')).toBeVisible();
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Unified B2B Marketplace');
  });

  test('should have working navigation', async ({ page }) => {
    // Check that navigation links exist
    await expect(page.locator('a[href="/marketplace"]')).toBeVisible();
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    
    // Test navigation to marketplace
    await page.click('a[href="/marketplace"]');
    await page.waitForURL('**/marketplace');
    await expect(page).toHaveURL(/marketplace/);
  });

  test('should have working dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');
    
    // Check dashboard loads
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Business Dashboard')).toBeVisible();
  });

  test('should have categories section', async ({ page }) => {
    // Check that categories exist (using first one)
    const categoryCards = page.locator('[data-testid="category-card"]');
    await expect(categoryCards.first()).toBeVisible();
    
    // Check that we have multiple categories
    const count = await categoryCards.count();
    expect(count).toBeGreaterThan(5);
  });

  test('should have working search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]');
    await expect(searchInput).toBeVisible();
    
    // Test search interaction
    await searchInput.fill('electronics');
    await searchInput.press('Enter');
    
    // Should still be on homepage
    await expect(page).toHaveURL(/localhost:3000/);
  });

  test('should have footer content', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer exists
    await expect(page.locator('footer')).toBeVisible();
    
    // Check footer links exist
    await expect(page.locator('a[href="/about"]')).toBeVisible();
    await expect(page.locator('a[href="/contact"]')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should still load
    await expect(page.locator('text=BELL24H')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('text=BELL24H')).toBeVisible();
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 15 seconds (generous for development)
    expect(loadTime).toBeLessThan(15000);
    console.log(`Homepage loaded in ${loadTime}ms`);
  });

  test('should have working marketplace page', async ({ page }) => {
    // Navigate to marketplace
    await page.goto('http://localhost:3000/marketplace');
    await page.waitForLoadState('networkidle');
    
    // Check marketplace loads
    await expect(page).toHaveURL(/marketplace/);
    await expect(page.locator('text=Marketplace')).toBeVisible();
  });

  test('should have working suppliers page', async ({ page }) => {
    // Navigate to suppliers page
    await page.goto('http://localhost:3000/suppliers');
    await page.waitForLoadState('networkidle');
    
    // Check suppliers page loads
    await expect(page).toHaveURL(/suppliers/);
    await expect(page.locator('text=Business Partners Directory')).toBeVisible();
  });

  test('should have working authentication pages', async ({ page }) => {
    // Test register page
    await page.goto('http://localhost:3000/auth/register');
    await expect(page.locator('text=Join BELL24H')).toBeVisible();
    
    // Test login page
    await page.goto('http://localhost:3000/auth/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should have working categories page', async ({ page }) => {
    // Navigate to categories
    await page.goto('http://localhost:3000/categories');
    await page.waitForLoadState('networkidle');
    
    // Check categories page loads
    await expect(page).toHaveURL(/categories/);
    await expect(page.locator('text=Business Categories')).toBeVisible();
  });

  test('should have working RFQ page', async ({ page }) => {
    // Navigate to RFQ page
    await page.goto('http://localhost:3000/rfq');
    await page.waitForLoadState('networkidle');
    
    // Check RFQ page loads
    await expect(page).toHaveURL(/rfq/);
    await expect(page.locator('text=Request for Quotation')).toBeVisible();
  });

  test('should have working about page', async ({ page }) => {
    // Navigate to about page
    await page.goto('http://localhost:3000/about');
    await page.waitForLoadState('networkidle');
    
    // Check about page loads
    await expect(page).toHaveURL(/about/);
    await expect(page.locator('text=About BELL24H')).toBeVisible();
  });

  test('should have working contact page', async ({ page }) => {
    // Navigate to contact page
    await page.goto('http://localhost:3000/contact');
    await page.waitForLoadState('networkidle');
    
    // Check contact page loads
    await expect(page).toHaveURL(/contact/);
    await expect(page.locator('text=Contact Us')).toBeVisible();
  });

  test('should have working privacy policy page', async ({ page }) => {
    // Navigate to privacy page
    await page.goto('http://localhost:3000/privacy');
    await page.waitForLoadState('networkidle');
    
    // Check privacy page loads
    await expect(page).toHaveURL(/privacy/);
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
  });

  test('should have working terms page', async ({ page }) => {
    // Navigate to terms page
    await page.goto('http://localhost:3000/terms');
    await page.waitForLoadState('networkidle');
    
    // Check terms page loads
    await expect(page).toHaveURL(/terms/);
    await expect(page.locator('text=Terms of Service')).toBeVisible();
  });
}); 
