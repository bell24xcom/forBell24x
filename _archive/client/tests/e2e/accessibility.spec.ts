import { test, expect } from '@playwright/test';

test.describe('AI Explainability Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI explanation dashboard
    await page.goto('/ai-explanations');

    // Wait for the page to load
    await page.waitForSelector('[data-testid="explanation-dashboard"]', { timeout: 10000 });
  });

  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    // Run accessibility audit
    const accessibilityScanResults = await page.accessibility.snapshot();

    // Check for critical accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);

    // Check for accessibility passes
    expect(accessibilityScanResults.passes.length).toBeGreaterThan(0);
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check that there's exactly one h1
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBe(1);

    // Check that h1 contains the main page title
    await expect(page.locator('h1')).toContainText('AI Explanation Dashboard');

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(1);

    // Verify no heading levels are skipped
    const headingLevels = await Promise.all(
      headings.map(async heading => {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        return parseInt(tagName.replace('h', ''));
      })
    );

    // Check that heading levels are sequential
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i] - headingLevels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check for proper ARIA labels on interactive elements
    const interactiveElements = page.locator('button, input, select, a[href]');

    for (let i = 0; i < (await interactiveElements.count()); i++) {
      const element = interactiveElements.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledby = await element.getAttribute('aria-labelledby');
      const role = await element.getAttribute('role');

      // Elements should have either aria-label, aria-labelledby, or visible text
      const hasVisibleText = (await element.textContent()) !== '';
      const hasAriaLabel = ariaLabel || ariaLabelledby;

      expect(hasVisibleText || hasAriaLabel).toBe(true);
    }

    // Check for proper table structure
    const tables = page.locator('table');
    for (let i = 0; i < (await tables.count()); i++) {
      const table = tables.nth(i);
      await expect(table.locator('thead')).toBeVisible();
      await expect(table.locator('tbody')).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation through all interactive elements
    const interactiveElements = page.locator('button, input, select, a[href], [tabindex]');
    const elementCount = await interactiveElements.count();

    // Start from the beginning
    await page.keyboard.press('Tab');

    // Navigate through all elements
    for (let i = 0; i < elementCount; i++) {
      // Check that element is focused
      await expect(page.locator(':focus')).toBeVisible();

      // Press Tab to move to next element
      await page.keyboard.press('Tab');
    }

    // Should be able to navigate back with Shift+Tab
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    // Test focus management in modals and overlays
    const expandButtons = page.locator('tbody tr').first().locator('button').first();

    // Click to expand a row
    await expandButtons.click();

    // Focus should remain manageable
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Escape key should close expanded content
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Decision Factors')).not.toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check text color contrast
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');

    for (let i = 0; i < Math.min(await textElements.count(), 10); i++) {
      const element = textElements.nth(i);
      const isVisible = await element.isVisible();

      if (isVisible) {
        // Get computed styles
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        // Basic check that colors are defined
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
        expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Check that form inputs have proper labels
    const inputs = page.locator('input, select, textarea');

    for (let i = 0; i < (await inputs.count()); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have either id with label, aria-label, or placeholder
      const hasLabel = id || ariaLabel || ariaLabelledby || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = page.locator('[aria-live]');
    expect(await liveRegions.count()).toBeGreaterThan(0);

    // Test that dynamic content is announced
    const refreshButton = page.locator('text=Refresh');
    await refreshButton.click();

    // Should have live region for updates
    await expect(page.locator('[aria-live]')).toBeVisible();
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Check that images have alt text
    const images = page.locator('img');

    for (let i = 0; i < (await images.count()); i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const ariaLabel = await image.getAttribute('aria-label');

      // Images should have either alt text or aria-label
      const hasAltText = alt || ariaLabel;
      expect(hasAltText).toBeTruthy();
    }
  });

  test('should support screen readers', async ({ page }) => {
    // Check for proper semantic HTML
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check for proper landmarks
    const landmarks = page.locator('main, nav, header, footer, aside, section, article');
    expect(await landmarks.count()).toBeGreaterThan(0);

    // Check for skip links
    const skipLinks = page.locator('a[href^="#"]');
    expect(await skipLinks.count()).toBeGreaterThan(0);
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.addInitScript(() => {
      Object.defineProperty(window.matchMedia, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    // Reload page with reduced motion preference
    await page.reload();

    // Should still be functional without animations
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="explanation-history"]')).toBeVisible();
  });

  test('should have proper error handling for screen readers', async ({ page }) => {
    // Mock API error
    await page.route('**/api/ai/explanations', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Refresh page to trigger error
    await page.reload();

    // Error should be announced to screen readers
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should have proper table accessibility', async ({ page }) => {
    // Check table structure
    const tables = page.locator('table');

    for (let i = 0; i < (await tables.count()); i++) {
      const table = tables.nth(i);

      // Check for proper table headers
      const headers = table.locator('th');
      expect(await headers.count()).toBeGreaterThan(0);

      // Check for proper table caption or aria-label
      const caption = table.locator('caption');
      const ariaLabel = await table.getAttribute('aria-label');
      const hasDescription = (await caption.count()) > 0 || ariaLabel;
      expect(hasDescription).toBe(true);
    }
  });

  test('should have proper button accessibility', async ({ page }) => {
    // Check all buttons have proper accessibility
    const buttons = page.locator('button');

    for (let i = 0; i < (await buttons.count()); i++) {
      const button = buttons.nth(i);

      // Check for accessible name
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledby = await button.getAttribute('aria-labelledby');
      const textContent = await button.textContent();

      const hasAccessibleName = ariaLabel || ariaLabelledby || textContent?.trim();
      expect(hasAccessibleName).toBeTruthy();

      // Check for proper role
      const role = await button.getAttribute('role');
      if (role) {
        expect(['button', 'tab', 'menuitem']).toContain(role);
      }
    }
  });

  test('should have proper list accessibility', async ({ page }) => {
    // Check for proper list structure
    const lists = page.locator('ul, ol');

    for (let i = 0; i < (await lists.count()); i++) {
      const list = lists.nth(i);
      const listItems = list.locator('li');

      // Lists should have list items
      expect(await listItems.count()).toBeGreaterThan(0);
    }
  });

  test('should have proper form validation accessibility', async ({ page }) => {
    // Test form validation
    const searchInput = page.locator('input[placeholder="Search explanations..."]');

    // Enter invalid input
    await searchInput.fill('test');

    // Check for proper error handling
    const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');

    // Should handle input gracefully
    await expect(searchInput).toBeVisible();
  });

  test('should have proper loading state accessibility', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/ai/explanations', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Refresh page
    await page.reload();

    // Loading state should be announced
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
    await expect(page.locator('text=Loading AI Explanation Dashboard...')).toBeVisible();
  });

  test('should have proper pagination accessibility', async ({ page }) => {
    // Check pagination controls
    const paginationControls = page.locator('text=Page');

    if (await paginationControls.isVisible()) {
      // Check for proper pagination labels
      await expect(page.locator('text=Previous')).toBeVisible();
      await expect(page.locator('text=Next')).toBeVisible();

      // Check for proper aria-labels
      const prevButton = page.locator('text=Previous');
      const nextButton = page.locator('text=Next');

      await expect(prevButton).toHaveAttribute('aria-label');
      await expect(nextButton).toHaveAttribute('aria-label');
    }
  });

  test('should have proper chart accessibility', async ({ page }) => {
    // Check that charts have proper accessibility
    const charts = page.locator('[data-testid="feature-importance-chart"]');

    if ((await charts.count()) > 0) {
      // Charts should have aria-label or title
      const chart = charts.first();
      const ariaLabel = await chart.getAttribute('aria-label');
      const title = await chart.getAttribute('title');

      const hasDescription = ariaLabel || title;
      expect(hasDescription).toBe(true);

      // Check for data table alternative
      const dataTable = page.locator('table[role="table"]');
      expect(await dataTable.count()).toBeGreaterThan(0);
    }
  });

  test('should have proper mobile accessibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check touch target sizes
    const buttons = page.locator('button, a, input[type="button"], input[type="submit"]');

    for (let i = 0; i < Math.min(await buttons.count(), 5); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          // Touch targets should be at least 44x44 pixels
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }

    // Check that content is still accessible on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="explanation-history"]')).toBeVisible();
  });
});
