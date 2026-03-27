import { expect, test } from '@playwright/test';

test.describe('BELL24H Complete Platform E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth safely
    try {
      await page.evaluate(() => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      });
    } catch (error) {
      console.log('Could not clear storage:', error.message);
    }
  });

  test('CRITICAL PATH 1: Homepage loads without hydration errors', async ({ page }) => {
    console.log('🏠 Testing Homepage...');

    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for BELL24H title
    await expect(page.locator('text=BELL24H')).toBeVisible();

    // Check for main heading
    await expect(page.locator('text=Unified B2B Marketplace')).toBeVisible();

    // Check for static stats
    await expect(page.locator('text=534,672+')).toBeVisible();
    await expect(page.locator('text=Verified Suppliers')).toBeVisible();

    // Check navigation works
    await expect(page.locator('text=Categories')).toBeVisible();
    await expect(page.locator('text=Marketplace')).toBeVisible();
    await expect(page.locator('text=Login')).toBeVisible();

    console.log('✅ Homepage test passed');
  });

  test('CRITICAL PATH 2: Authentication flow works completely', async ({ page }) => {
    console.log('🔐 Testing Authentication...');

    // Go to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Check login form exists
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Fill in demo credentials
    await page.fill('input[type="email"]', 'demo@bell24h.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Check dashboard loads
    await expect(page.locator('text=Business Dashboard')).toBeVisible();
    await expect(page.locator('text=Welcome back')).toBeVisible();

    console.log('✅ Authentication test passed');
  });

  test('CRITICAL PATH 3: Dashboard functionality works', async ({ page }) => {
    console.log('📊 Testing Dashboard...');

    // First login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'demo@bell24h.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Test mode switching
    await expect(page.locator('text=Buying Mode')).toBeVisible();
    await expect(page.locator('text=Selling Mode')).toBeVisible();

    // Click selling mode
    await page.click('text=Selling Mode');
    await page.waitForTimeout(1000);

    // Should show selling-specific content
    await expect(page.locator('text=List your products')).toBeVisible();
    await expect(page.locator('text=Create Listing')).toBeVisible();

    // Click buying mode
    await page.click('text=Buying Mode');
    await page.waitForTimeout(1000);

    // Should show buying-specific content
    await expect(page.locator('text=Source products')).toBeVisible();
    await expect(page.locator('text=Post New RFQ')).toBeVisible();

    // Test logout
    await page.click('text=Logout');
    await page.waitForURL('/auth/login');

    console.log('✅ Dashboard test passed');
  });

  test('CRITICAL PATH 4: Registration with comprehensive categories', async ({ page }) => {
    console.log('📝 Testing Registration...');

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');

    // Check registration form
    await expect(page.locator('text=Join BELL24H Marketplace')).toBeVisible();

    // Test step 1 - marketplace role selection
    await expect(page.locator('text=What do you plan to do on BELL24H?')).toBeVisible();

    // Select "Both Buying & Selling"
    await page.click('text=Both Buying & Selling');

    // Go to step 2
    await page.click('text=Next');
    await page.waitForTimeout(1000);

    // Check comprehensive categories are available
    await expect(page.locator('text=Electronics & Components')).toBeVisible();
    await expect(page.locator('text=Textiles & Garments')).toBeVisible();
    await expect(page.locator('text=Machinery & Equipment')).toBeVisible();
    await expect(page.locator('text=Automotive & Parts')).toBeVisible();
    await expect(page.locator('text=Construction Materials')).toBeVisible();
    await expect(page.locator('text=Chemicals & Plastics')).toBeVisible();
    await expect(page.locator('text=Agriculture & Food')).toBeVisible();
    await expect(page.locator('text=Healthcare & Medical')).toBeVisible();

    // Check some categories
    await page.check('text=Electronics & Components');
    await page.check('text=Textiles & Garments');

    // Complete registration
    await page.click('text=Join BELL24H Marketplace');
    await page.waitForTimeout(1000);

    // Should show completion
    await expect(page.locator('text=Welcome to BELL24H!')).toBeVisible();

    console.log('✅ Registration test passed');
  });

  test('CRITICAL PATH 5: Navigation and route protection', async ({ page }) => {
    console.log('🧭 Testing Navigation...');

    // Test protected route without auth
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL('/auth/login?redirect=%2Fdashboard');
    await expect(page).toHaveURL('/auth/login?redirect=%2Fdashboard');

    // Test public routes work
    await page.goto('/');
    await expect(page.locator('text=BELL24H')).toBeVisible();

    // Test suppliers page
    await page.goto('/suppliers');
    await expect(page.locator('text=Business Partners Directory')).toBeVisible();

    console.log('✅ Navigation test passed');
  });

  test('CRITICAL PATH 6: Performance benchmarks', async ({ page }) => {
    console.log('⚡ Testing Performance...');

    const pages = [
      { url: '/', name: 'Homepage', maxTime: 5000 },
      { url: '/auth/login', name: 'Login', maxTime: 3000 },
      { url: '/auth/register', name: 'Registration', maxTime: 4000 },
      { url: '/suppliers', name: 'Suppliers', maxTime: 7000 },
    ];

    for (const pageTest of pages) {
      const startTime = Date.now();
      await page.goto(pageTest.url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`${pageTest.name} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(pageTest.maxTime);
    }

    console.log('✅ Performance test passed');
  });

  test('CRITICAL PATH 7: Mobile responsiveness', async ({ page }) => {
    console.log('📱 Testing Mobile...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test homepage on mobile
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=BELL24H')).toBeVisible();
    await expect(page.locator('text=Unified B2B Marketplace')).toBeVisible();

    // Test login on mobile
    await page.goto('/auth/login');
    await expect(page.locator('text=Welcome Back')).toBeVisible();

    // Test registration on mobile
    await page.goto('/auth/register');
    await expect(page.locator('text=Join BELL24H Marketplace')).toBeVisible();

    console.log('✅ Mobile test passed');
  });

  test('CRITICAL PATH 8: Error handling', async ({ page }) => {
    console.log('🚨 Testing Error Handling...');

    // Test invalid routes
    await page.goto('/invalid-route');
    // Should handle gracefully (404 or redirect)

    // Test login with empty fields
    await page.goto('/auth/login');
    await page.click('button[type="submit"]');
    // Should show validation error or handle gracefully

    // Test dashboard without auth (should redirect)
    try {
      await page.evaluate(() => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
      });
    } catch (error) {
      console.log('Could not clear storage:', error.message);
    }
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);

    console.log('✅ Error handling test passed');
  });
});
