import { test, expect } from '@playwright/test';

test.describe('BELL24H Quick Optimization Test', () => {
  test('should load homepage with optimizations', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Test hydration guard
    await expect(page.locator('[data-testid="bell24h-logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Unified B2B Marketplace');
    
    // Test live stats with test IDs
    await page.waitForSelector('[data-testid="suppliers-count"]');
    await expect(page.locator('[data-testid="suppliers-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="buyers-count"]')).toBeVisible();
    
    // Test voice RFQ button
    await expect(page.locator('[data-testid="voice-rfq-btn"]')).toBeVisible();
    
    // Test AI search button
    await expect(page.locator('[data-testid="ai-search-btn"]')).toBeVisible();
    
    console.log('✅ All optimizations working correctly!');
  });

  test('should test Google login page', async ({ page }) => {
    await page.goto('http://localhost:3001/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Test Google login button
    await expect(page.locator('[data-testid="google-login-btn"]')).toBeVisible();
    
    // Test email login form
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit-btn"]')).toBeVisible();
    
    console.log('✅ Google login page working correctly!');
  });

  test('should test authentication flow', async ({ page }) => {
    // Test protected route redirect
    await page.goto('http://localhost:3001/dashboard');
    await expect(page).toHaveURL(/auth\/login/);
    
    // Test login
    await page.goto('http://localhost:3001/auth/login');
    await page.locator('[data-testid="email-input"]').fill('demo@bell24h.com');
    await page.locator('[data-testid="password-input"]').fill('demo123');
    await page.locator('[data-testid="login-submit-btn"]').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    console.log('✅ Authentication flow working correctly!');
  });
}); 
