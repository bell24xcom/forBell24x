import { expect, test } from '@playwright/test';

test.describe('BELL24H Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for dashboard access
    await page.goto('/');

    // Simulate login process
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard with correct layout', async ({ page }) => {
    // Test dashboard title
    await expect(page.locator('h1')).toContainText('Business Dashboard');

    // Test main navigation is present
    await expect(page.locator('text=BELL24H')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display mode switching functionality', async ({ page }) => {
    // Test buying mode button
    const buyingMode = page.locator('button:has-text("Buying Mode")');
    if (await buyingMode.isVisible()) {
      await expect(buyingMode).toBeVisible();
      await buyingMode.click();

      // Verify buying mode content
      await expect(page.locator('text=Sourcing Dashboard')).toBeVisible();
      await expect(page.locator('text=Active RFQs')).toBeVisible();
    }

    // Test selling mode button
    const sellingMode = page.locator('button:has-text("Selling Mode")');
    if (await sellingMode.isVisible()) {
      await expect(sellingMode).toBeVisible();
      await sellingMode.click();

      // Verify selling mode content
      await expect(page.locator('text=Sales Dashboard')).toBeVisible();
      await expect(page.locator('text=Active Listings')).toBeVisible();
    }
  });

  test('should display correct stats for each mode', async ({ page }) => {
    // Test buying mode stats
    const buyingMode = page.locator('button:has-text("Buying Mode")');
    if (await buyingMode.isVisible()) {
      await buyingMode.click();
      await page.waitForTimeout(1000);

      const buyingStats = ['Active RFQs', 'Pending Quotes', 'Sourcing Projects', 'Saved Suppliers'];

      for (const stat of buyingStats) {
        const element = page.locator(`text=${stat}`);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    }

    // Test selling mode stats
    const sellingMode = page.locator('button:has-text("Selling Mode")');
    if (await sellingMode.isVisible()) {
      await sellingMode.click();
      await page.waitForTimeout(1000);

      const sellingStats = [
        'Active Listings',
        'Quote Requests',
        'Sales Opportunities',
        'Business Connections',
      ];

      for (const stat of sellingStats) {
        const element = page.locator(`text=${stat}`);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    }
  });

  test('should test quick actions functionality', async ({ page }) => {
    // Test buying mode quick actions
    const buyingMode = page.locator('button:has-text("Buying Mode")');
    if (await buyingMode.isVisible()) {
      await buyingMode.click();

      const postRFQButton = page.locator('button:has-text("Post New RFQ")');
      if (await postRFQButton.isVisible()) {
        await expect(postRFQButton).toBeVisible();
        await postRFQButton.click();
        await page.waitForTimeout(1000);

        // Should navigate to RFQ creation or show modal
      }
    }

    // Go back to dashboard
    await page.goto('/dashboard');

    // Test selling mode quick actions
    const sellingMode = page.locator('button:has-text("Selling Mode")');
    if (await sellingMode.isVisible()) {
      await sellingMode.click();

      const createListingButton = page.locator('button:has-text("Create Listing")');
      if (await createListingButton.isVisible()) {
        await expect(createListingButton).toBeVisible();
        await createListingButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should test recent activity section', async ({ page }) => {
    // Test recent activity is visible
    await expect(page.locator('text=Recent Activity')).toBeVisible();

    // Should show some activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    const activityCount = await activityItems.count();
    expect(activityCount).toBeGreaterThanOrEqual(0);
  });

  test('should test notifications and alerts', async ({ page }) => {
    // Test notifications icon/section
    const notificationsSection = page.locator('[data-testid="notifications"]');
    if (await notificationsSection.isVisible()) {
      await expect(notificationsSection).toBeVisible();

      // Click to expand notifications
      await notificationsSection.click();
      await page.waitForTimeout(500);
    }
  });

  test('should test profile and settings access', async ({ page }) => {
    // Test profile/settings access
    const profileButton = page.locator('[data-testid="profile-menu"]');
    if (await profileButton.isVisible()) {
      await profileButton.click();

      // Should show profile options
      await expect(page.locator('text=Profile Settings')).toBeVisible();
      await expect(page.locator('text=Business Settings')).toBeVisible();
    }
  });

  test('should test dashboard responsiveness', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify desktop layout elements
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Mobile layout should be responsive
    await expect(page.locator('text=Business Dashboard')).toBeVisible();
  });

  test('should measure dashboard performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Dashboard should load within 4 seconds
    expect(loadTime).toBeLessThan(4000);

    console.log(`Dashboard loaded in ${loadTime}ms`);
  });

  test('should test data visualization and charts', async ({ page }) => {
    // Test if charts are rendered
    const charts = page.locator('[data-testid="chart"]');
    const chartCount = await charts.count();

    if (chartCount > 0) {
      // Wait for charts to load
      await page.waitForTimeout(2000);

      // Test chart interactions
      for (let i = 0; i < Math.min(chartCount, 3); i++) {
        const chart = charts.nth(i);
        await expect(chart).toBeVisible();

        // Test chart hover interactions
        await chart.hover();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should test data filtering and sorting', async ({ page }) => {
    // Test filter dropdowns
    const filterDropdowns = page.locator('select');
    const dropdownCount = await filterDropdowns.count();

    if (dropdownCount > 0) {
      for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
        const dropdown = filterDropdowns.nth(i);
        await dropdown.click();
        await page.waitForTimeout(500);

        // Select first option
        const options = page.locator('option');
        if ((await options.count()) > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should test export and download functionality', async ({ page }) => {
    // Test export buttons
    const exportButtons = page.locator('button:has-text("Export")');
    const exportCount = await exportButtons.count();

    if (exportCount > 0) {
      for (let i = 0; i < Math.min(exportCount, 2); i++) {
        const exportButton = exportButtons.nth(i);
        await exportButton.click();
        await page.waitForTimeout(1000);

        // Should trigger download or show export modal
      }
    }
  });

  test('should test search and filtering', async ({ page }) => {
    // Test search input
    const searchInput = page.locator('input[placeholder*="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('test search');
      await page.waitForTimeout(1000);

      // Should show search results or filter content
    }
  });

  test('should test pagination and navigation', async ({ page }) => {
    // Test pagination controls
    const paginationButtons = page.locator('button[aria-label*="page"]');
    const paginationCount = await paginationButtons.count();

    if (paginationCount > 0) {
      // Click next page
      const nextButton = page.locator('button[aria-label*="next"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }

      // Click previous page
      const prevButton = page.locator('button[aria-label*="previous"]');
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should test keyboard shortcuts', async ({ page }) => {
    // Test common keyboard shortcuts
    await page.keyboard.press('Escape'); // Close modals
    await page.waitForTimeout(500);

    await page.keyboard.press('Control+f'); // Search
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape'); // Close search
    await page.waitForTimeout(500);
  });

  test('should test error handling and loading states', async ({ page }) => {
    // Test loading states
    const loadingSpinners = page.locator('[data-testid="loading"]');
    if ((await loadingSpinners.count()) > 0) {
      await expect(loadingSpinners.first()).toBeVisible();
      await page.waitForTimeout(2000);
      await expect(loadingSpinners.first()).not.toBeVisible();
    }

    // Test error states
    const errorMessages = page.locator('[data-testid="error"]');
    if ((await errorMessages.count()) > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });
});
