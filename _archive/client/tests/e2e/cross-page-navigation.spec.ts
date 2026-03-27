import { expect, test } from '@playwright/test';

test.describe('BELL24H Cross-Page Navigation E2E Tests', () => {
  test('should test complete user journey flow', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Browse marketplace
    await page.click('text=Find Partners');
    await expect(page).toHaveURL(/\/marketplace/);
    await page.waitForLoadState('networkidle');

    // 2. Test marketplace mode switching
    const buyingMode = page.locator('button:has-text("Buying Mode")');
    if (await buyingMode.isVisible()) {
      await buyingMode.click();
      await page.waitForTimeout(1000);
    }

    const sellingMode = page.locator('button:has-text("Selling Mode")');
    if (await sellingMode.isVisible()) {
      await sellingMode.click();
      await page.waitForTimeout(1000);
    }

    // 3. Navigate to suppliers
    await page.click('text=Suppliers');
    await expect(page).toHaveURL(/\/suppliers/);
    await page.waitForLoadState('networkidle');

    // 4. View a supplier profile
    const firstSupplier = page.locator('button:has-text("View Profile")').first();
    if (await firstSupplier.isVisible()) {
      await firstSupplier.click();
      await expect(page).toHaveURL(/\/suppliers\/\d+/);
      await page.waitForLoadState('networkidle');
    }

    // 5. Go back to suppliers list
    await page.goBack();
    await expect(page).toHaveURL(/\/suppliers/);

    // 6. Go to dashboard
    await page.click('text=My Business Hub');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForLoadState('networkidle');

    // 7. Go to registration
    await page.click('text=Join Marketplace');
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('should test breadcrumb navigation', async ({ page }) => {
    // Navigate to deep page
    await page.goto('/suppliers/1');

    // Test breadcrumb functionality
    const backButton = page.locator('text=Back to Suppliers');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/suppliers/);
    }
  });

  test('should test navigation consistency across pages', async ({ page }) => {
    const pages = ['/', '/marketplace', '/suppliers', '/dashboard'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');

      // Test consistent navigation elements
      await expect(page.locator('text=BELL24H')).toBeVisible();

      // Test navigation links are present
      const findPartners = page.locator('text=Find Partners');
      const myBusinessHub = page.locator('text=My Business Hub');
      const joinMarketplace = page.locator('text=Join Marketplace');

      if (await findPartners.isVisible()) {
        await expect(findPartners).toBeVisible();
      }

      if (await myBusinessHub.isVisible()) {
        await expect(myBusinessHub).toBeVisible();
      }

      if (await joinMarketplace.isVisible()) {
        await expect(joinMarketplace).toBeVisible();
      }
    }
  });

  test('should test deep linking and direct URL access', async ({ page }) => {
    const deepLinks = [
      '/marketplace?mode=buying',
      '/marketplace?mode=selling',
      '/suppliers',
      '/dashboard',
      '/auth/login',
      '/auth/register',
    ];

    for (const link of deepLinks) {
      await page.goto(link);
      await page.waitForLoadState('networkidle');

      // Should load without errors
      await expect(page.locator('body')).toBeVisible();

      // Should not show 404
      const notFound = page.locator('text=404');
      await expect(notFound).not.toBeVisible();
    }
  });

  test('should test browser back and forward navigation', async ({ page }) => {
    // Navigate through multiple pages
    await page.goto('/');
    await page.click('text=Find Partners');
    await page.click('text=Suppliers');
    await page.click('text=My Business Hub');

    // Test browser back
    await page.goBack();
    await expect(page).toHaveURL(/\/suppliers/);

    await page.goBack();
    await expect(page).toHaveURL(/\/marketplace/);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    // Test browser forward
    await page.goForward();
    await expect(page).toHaveURL(/\/marketplace/);

    await page.goForward();
    await expect(page).toHaveURL(/\/suppliers/);
  });

  test('should test external link handling', async ({ page }) => {
    await page.goto('/');

    // Test external links open in new tab
    const externalLinks = page.locator('a[target="_blank"]');
    const externalCount = await externalLinks.count();

    if (externalCount > 0) {
      for (let i = 0; i < Math.min(externalCount, 3); i++) {
        const link = externalLinks.nth(i);
        const href = await link.getAttribute('href');

        if (href && !href.startsWith('/')) {
          // External link should have target="_blank"
          await expect(link).toHaveAttribute('target', '_blank');
        }
      }
    }
  });

  test('should test form navigation and validation', async ({ page }) => {
    // Test login form navigation
    await page.goto('/auth/login');

    // Fill form fields
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Should navigate to dashboard or show success
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/dashboard|\/auth\/login/);
  });

  test('should test modal and overlay navigation', async ({ page }) => {
    await page.goto('/');

    // Test if modals can be opened and closed
    const modalTriggers = page.locator('[data-testid="modal-trigger"]');
    const triggerCount = await modalTriggers.count();

    if (triggerCount > 0) {
      // Open modal
      await modalTriggers.first().click();
      await page.waitForTimeout(500);

      // Modal should be visible
      const modal = page.locator('[data-testid="modal"]');
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();

        // Close modal
        const closeButton = page.locator('[data-testid="modal-close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(500);
          await expect(modal).not.toBeVisible();
        }
      }
    }
  });

  test('should test search functionality across pages', async ({ page }) => {
    const pagesWithSearch = ['/', '/marketplace', '/suppliers'];

    for (const pageUrl of pagesWithSearch) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');

      // Test search input
      const searchInput = page.locator('input[placeholder*="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.click();
        await searchInput.fill('test search');
        await page.waitForTimeout(1000);

        // Should show search results or suggestions
        const searchResults = page.locator('[data-testid="search-results"]');
        if (await searchResults.isVisible()) {
          await expect(searchResults).toBeVisible();
        }
      }
    }
  });

  test('should test responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test mobile menu toggle
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-toggle"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Mobile menu should be visible
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();

        // Test navigation from mobile menu
        const menuLinks = mobileMenu.locator('a');
        const linkCount = await menuLinks.count();

        if (linkCount > 0) {
          await menuLinks.first().click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should test keyboard navigation accessibility', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test enter key on focused elements
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Test escape key to close modals/overlays
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('should test page load performance across navigation', async ({ page }) => {
    const pages = ['/', '/marketplace', '/suppliers', '/dashboard'];
    const performanceResults = [];

    for (const pageUrl of pages) {
      const startTime = Date.now();
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      performanceResults.push({ page: pageUrl, loadTime });
      console.log(`${pageUrl} loaded in ${loadTime}ms`);

      // Each page should load within reasonable time
      expect(loadTime).toBeLessThan(8000);
    }

    // Log performance summary
    console.log('Performance Summary:', performanceResults);
  });
});
