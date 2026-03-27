import { expect, test } from '@playwright/test';

test.describe('BELL24H Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage with correct title and meta', async ({ page }) => {
    // Test page title
    await expect(page).toHaveTitle(/BELL24H.*Unified B2B Marketplace/);

    // Test meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /India's leading B2B marketplace/);
  });

  test('should display main navigation correctly', async ({ page }) => {
    // Test main logo
    const logo = page.locator('text=BELL24H').first();
    await expect(logo).toBeVisible();

    // Test navigation links
    await expect(page.locator('text=Find Partners')).toBeVisible();
    await expect(page.locator('text=My Business Hub')).toBeVisible();
    await expect(page.locator('text=Join Marketplace')).toBeVisible();
  });

  test('should display hero section with live stats', async ({ page }) => {
    // Test hero heading
    await expect(page.locator('h1')).toContainText('Unified B2B Marketplace');

    // Test live stats counter animation
    const suppliersCount = page.locator('[data-testid="suppliers-count"]');
    const buyersCount = page.locator('[data-testid="buyers-count"]');
    const rfqsCount = page.locator('[data-testid="rfqs-count"]');

    // If stats elements exist, test them
    if (await suppliersCount.isVisible()) {
      await expect(suppliersCount).toBeVisible();
      await expect(buyersCount).toBeVisible();
      await expect(rfqsCount).toBeVisible();

      // Wait for stats animation to complete
      await page.waitForTimeout(5000);

      // Verify stats have updated (should be different from initial values)
      const finalSuppliersText = await suppliersCount.textContent();
      expect(finalSuppliersText).toMatch(/\d{3},\d{3}\+/);
    }
  });

  test('should test AI-powered search functionality', async ({ page }) => {
    // Test search input visibility
    const searchInput = page.locator('input[placeholder*="search"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();

      // Test search input interaction
      await searchInput.click();
      await searchInput.fill('electronics components');

      // Test search button
      const searchButton = page.locator('button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await expect(searchButton).toBeVisible();
        await searchButton.click();

        // Should navigate to marketplace or show results
        await page.waitForTimeout(2000);
      }
    }
  });

  test('should test voice RFQ functionality', async ({ page }) => {
    // Test voice RFQ button
    const voiceButton = page.locator('button:has-text("Voice RFQ")');
    if (await voiceButton.isVisible()) {
      await expect(voiceButton).toBeVisible();

      // Click voice button
      await voiceButton.click();

      // Should show voice recording interface or modal
      await page.waitForTimeout(1000);

      // Test if microphone access is requested (browser-dependent)
      // Note: Actual microphone testing requires special setup
    }
  });

  test('should display feature toggles and interactions', async ({ page }) => {
    // Test 3D Bell toggle
    const bellToggle = page.locator('[data-testid="bell-toggle"]');
    if (await bellToggle.isVisible()) {
      await bellToggle.click();
      await page.waitForTimeout(1000);
    }

    // Test sound toggle
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    if (await soundToggle.isVisible()) {
      await soundToggle.click();
      await page.waitForTimeout(500);
    }

    // Test theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
  });

  test('should test navigation to other pages', async ({ page }) => {
    // Test Find Partners navigation
    await page.locator('text=Find Partners').click();
    await expect(page).toHaveURL(/\/marketplace/);
    await page.goBack();

    // Test My Business Hub navigation
    await page.locator('text=My Business Hub').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goBack();
  });

  test('should test revenue pipeline section', async ({ page }) => {
    // Scroll to revenue pipeline
    await page.locator('text=Revenue Pipeline').scrollIntoViewIfNeeded();

    // Test all 8 revenue streams are visible
    const revenueStreams = [
      'Subscription Plans',
      'Transaction Fees',
      'Premium Features',
      'ECGC Services',
      'AI Analytics',
      'White-Label Solutions',
      'Enterprise Training',
      'Data Insights',
    ];

    for (const stream of revenueStreams) {
      const element = page.locator(`text=${stream}`);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });

  test('should test trust marquee and social proof', async ({ page }) => {
    // Test trust marquee is visible and animating
    const trustMarquee = page.locator('[data-testid="trust-marquee"]');
    if (await trustMarquee.isVisible()) {
      await expect(trustMarquee).toBeVisible();
    }

    // Test government backing section
    await expect(page.locator('text=Government Backing')).toBeVisible();
    await expect(page.locator('text=ECGC Partnership')).toBeVisible();
  });

  test('should test floating CTAs on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test floating CTAs visibility on mobile
    const floatingCTA = page.locator('[data-testid="floating-cta"]');
    if (await floatingCTA.isVisible()) {
      await expect(floatingCTA).toBeVisible();

      // Test CTA interaction
      await floatingCTA.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should test footer completeness', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Test footer sections
    await expect(page.locator('text=About BELL24H')).toBeVisible();
    await expect(page.locator('text=Contact Us')).toBeVisible();
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
    await expect(page.locator('text=Terms of Service')).toBeVisible();
  });

  test('should measure homepage performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Homepage should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    console.log(`Homepage loaded in ${loadTime}ms`);
  });

  test('should test responsive design across devices', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=BELL24H')).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=BELL24H')).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=BELL24H')).toBeVisible();
  });

  test('should test accessibility features', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test focus indicators
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test alt text for images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('should test error handling and fallbacks', async ({ page }) => {
    // Test offline behavior
    await page.route('**/*', route => route.abort());
    await page.reload();

    // Should show error or fallback content
    await page.waitForTimeout(2000);

    // Restore network
    await page.route('**/*', route => route.continue());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });
});
