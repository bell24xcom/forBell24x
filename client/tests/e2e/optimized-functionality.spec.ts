import { expect, test } from '@playwright/test';

test.describe('BELL24H Optimized Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage with hydration guard', async ({ page }) => {
    await expect(page).toHaveTitle(/BELL24H/);
    await expect(page.locator('[data-testid="bell24h-logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Unified B2B Marketplace');
  });

  test('should display live stats with proper test IDs', async ({ page }) => {
    // Wait for hydration to complete
    await page.waitForSelector('[data-testid="suppliers-count"]');
    
    const suppliersCount = page.locator('[data-testid="suppliers-count"]');
    const buyersCount = page.locator('[data-testid="buyers-count"]');
    const rfqsCount = page.locator('[data-testid="rfqs-count"]');
    const volumeCount = page.locator('[data-testid="volume-count"]');
    
    await expect(suppliersCount).toBeVisible();
    await expect(buyersCount).toBeVisible();
    await expect(rfqsCount).toBeVisible();
    await expect(volumeCount).toBeVisible();
  });

  test('should test voice RFQ with proper selector', async ({ page }) => {
    const voiceButton = page.locator('[data-testid="voice-rfq-btn"]');
    await expect(voiceButton).toBeVisible();
    await voiceButton.click();
    
    // Wait for voice recording to complete
    await page.waitForTimeout(3500);
  });

  test('should test AI search button', async ({ page }) => {
    const aiButton = page.locator('[data-testid="ai-search-btn"]');
    await expect(aiButton).toBeVisible();
    await aiButton.click();
  });

  test('should have working navigation links', async ({ page }) => {
    const marketplaceLink = page.locator('[data-testid="marketplace-link"]');
    await expect(marketplaceLink).toBeVisible();
    await marketplaceLink.click();
    await page.waitForURL('**/marketplace**');
  });

  test('should test mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMarketplaceLink = page.locator('[data-testid="mobile-marketplace-link"]');
    await expect(mobileMarketplaceLink).toBeVisible();
    
    await mobileMarketplaceLink.click();
    await page.waitForURL('**/marketplace**');
  });

  test('should test Google login button', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');
    
    const googleButton = page.locator('[data-testid="google-login-btn"]');
    await expect(googleButton).toBeVisible();
  });

  test('should test email login form', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    const submitButton = page.locator('[data-testid="login-submit-btn"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    await emailInput.fill('demo@bell24h.com');
    await passwordInput.fill('demo123');
    await submitButton.click();
  });

  test('should test dashboard access with authentication', async ({ page }) => {
    // First login
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('[data-testid="email-input"]').fill('demo@bell24h.com');
    await page.locator('[data-testid="password-input"]').fill('demo123');
    await page.locator('[data-testid="login-submit-btn"]').click();
    
    // Then access dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should be able to access dashboard after login
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should test marketplace page', async ({ page }) => {
    await page.goto('http://localhost:3001/marketplace');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/marketplace/);
  });

  test('should test categories page', async ({ page }) => {
    await page.goto('http://localhost:3001/categories');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/categories/);
  });

  test('should test about page', async ({ page }) => {
    await page.goto('http://localhost:3001/about');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/about/);
  });

  test('should test contact page', async ({ page }) => {
    await page.goto('http://localhost:3001/contact');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/contact/);
  });

  test('should test privacy policy page', async ({ page }) => {
    await page.goto('http://localhost:3001/privacy');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/privacy/);
  });

  test('should test terms page', async ({ page }) => {
    await page.goto('http://localhost:3001/terms');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/terms/);
  });

  test('should test RFQ page', async ({ page }) => {
    await page.goto('http://localhost:3001/rfq');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/rfq/);
  });

  test('should test suppliers page', async ({ page }) => {
    await page.goto('http://localhost:3001/suppliers');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/suppliers/);
  });

  test('should test pricing page', async ({ page }) => {
    await page.goto('http://localhost:3001/pricing');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/pricing/);
  });

  test('should test responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="bell24h-logo"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="marketplace-link"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="marketplace-link"]')).toBeVisible();
  });

  test('should test load time performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    console.log(`Homepage loaded in ${loadTime}ms`);
  });

  test('should test error handling', async ({ page }) => {
    // Test 404 page
    await page.goto('http://localhost:3001/nonexistent-page');
    
    // Should handle gracefully
    await expect(page).toHaveURL(/nonexistent-page/);
  });

  test('should test authentication flow', async ({ page }) => {
    // Test protected route without login
    await page.goto('http://localhost:3001/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/auth\/login/);
    
    // Login
    await page.locator('[data-testid="email-input"]').fill('demo@bell24h.com');
    await page.locator('[data-testid="password-input"]').fill('demo123');
    await page.locator('[data-testid="login-submit-btn"]').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
}); 
