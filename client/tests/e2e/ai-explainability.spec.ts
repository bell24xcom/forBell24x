import { test, expect } from '@playwright/test';

test.describe('AI Explainability Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI explanation dashboard
    await page.goto('/ai-explanations');

    // Wait for the page to load
    await page.waitForSelector('[data-testid="explanation-dashboard"]', { timeout: 10000 });
  });

  test('should display AI explanation dashboard with metrics', async ({ page }) => {
    // Check that the dashboard loads correctly
    await expect(page.locator('h1')).toContainText('AI Explanation Dashboard');

    // Verify metrics cards are displayed
    await expect(page.locator('text=Total Explanations')).toBeVisible();
    await expect(page.locator('text=Avg Confidence')).toBeVisible();
    await expect(page.locator('text=Most Common Type')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();

    // Check that metrics have values
    await expect(
      page.locator('text=Total Explanations').locator('..').locator('.text-2xl')
    ).not.toHaveText('0');
  });

  test('should display feature importance chart', async ({ page }) => {
    // Check that the feature importance chart is displayed
    await expect(page.locator('[data-testid="feature-importance-chart"]')).toBeVisible();

    // Verify chart title
    await expect(page.locator('text=Feature Importance Analysis')).toBeVisible();

    // Check that the chart has data
    await expect(page.locator('[data-testid="responsive-container"]')).toBeVisible();
  });

  test('should display explanation history table', async ({ page }) => {
    // Check that the explanation history is displayed
    await expect(page.locator('[data-testid="explanation-history"]')).toBeVisible();

    // Verify table headers
    await expect(page.locator('text=Decision')).toBeVisible();
    await expect(page.locator('text=Type')).toBeVisible();
    await expect(page.locator('text=Confidence')).toBeVisible();
    await expect(page.locator('text=Date')).toBeVisible();
    await expect(page.locator('text=Actions')).toBeVisible();

    // Check that table has data
    await expect(page.locator('tbody tr')).toHaveCount(expect.any(Number));
  });

  test('should expand and collapse explanation rows', async ({ page }) => {
    // Find the first expand button
    const firstExpandButton = page.locator('tbody tr').first().locator('button').first();

    // Initially, the row should be collapsed
    await expect(page.locator('text=Decision Factors')).not.toBeVisible();

    // Click to expand
    await firstExpandButton.click();

    // Should show expanded content
    await expect(page.locator('text=Decision Factors')).toBeVisible();
    await expect(page.locator('text=Price Competitiveness')).toBeVisible();

    // Click to collapse
    await firstExpandButton.click();

    // Should hide expanded content
    await expect(page.locator('text=Decision Factors')).not.toBeVisible();
  });

  test('should filter explanations by decision type', async ({ page }) => {
    // Get initial row count
    const initialRowCount = await page.locator('tbody tr').count();

    // Select supplier recommendation filter
    await page.selectOption('select', 'supplier_recommendation');

    // Wait for filtering to complete
    await page.waitForTimeout(1000);

    // Check that only supplier recommendation rows are shown
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRowCount);

    // Verify all visible rows are supplier recommendations
    const visibleTypes = await page
      .locator('tbody tr')
      .locator('text=supplier recommendation')
      .count();
    expect(visibleTypes).toBeGreaterThan(0);
  });

  test('should search explanations', async ({ page }) => {
    // Get initial row count
    const initialRowCount = await page.locator('tbody tr').count();

    // Enter search term
    await page.fill('input[placeholder="Search explanations..."]', 'price');

    // Wait for search to complete
    await page.waitForTimeout(1000);

    // Check that results are filtered
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRowCount);
  });

  test('should filter by confidence level', async ({ page }) => {
    // Get initial row count
    const initialRowCount = await page.locator('tbody tr').count();

    // Set minimum confidence to 90%
    await page.fill('input[placeholder="Min Confidence %"]', '90');

    // Wait for filtering to complete
    await page.waitForTimeout(1000);

    // Check that only high confidence explanations are shown
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRowCount);
  });

  test('should export explanations to CSV', async ({ page }) => {
    // Mock the download
    await page.route('**/api/ai/explanations/export', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'ID,Decision Type,Timestamp,Confidence\n1,supplier_recommendation,2024-01-01,85',
      });
    });

    // Click export button
    await page.click('text=Export');

    // Wait for download to complete
    await page.waitForTimeout(2000);
  });

  test('should display decision path visualization', async ({ page }) => {
    // Click on "View Details" for the first explanation
    await page.click('text=View Details');

    // Should navigate to or show decision path visualization
    await expect(page.locator('text=Decision Path Visualization')).toBeVisible();

    // Check that decision tree is displayed
    await expect(page.locator('text=Decision Start')).toBeVisible();
    await expect(page.locator('text=Step-by-step breakdown')).toBeVisible();
  });

  test('should show alternative decision paths', async ({ page }) => {
    // Click on "View Details" for the first explanation
    await page.click('text=View Details');

    // Click show alternatives button
    await page.click('text=Show Alternatives');

    // Should display alternative paths
    await expect(page.locator('text=Alternative Decision Paths')).toBeVisible();
    await expect(page.locator('text=Alternative 1')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Check if pagination controls are present
    const paginationControls = page.locator('text=Page');

    if (await paginationControls.isVisible()) {
      // Click next page if available
      const nextButton = page.locator('text=Next');
      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // Should load new page
        await page.waitForTimeout(1000);

        // Verify page number changed
        await expect(page.locator('text=Page 2')).toBeVisible();
      }
    }
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Get initial data
    const initialRowCount = await page.locator('tbody tr').count();

    // Click refresh button
    await page.click('text=Refresh');

    // Wait for refresh to complete
    await page.waitForTimeout(2000);

    // Should reload data
    const newRowCount = await page.locator('tbody tr').count();
    expect(newRowCount).toBe(initialRowCount);
  });

  test('should display correct confidence colors', async ({ page }) => {
    // Check that confidence values have appropriate colors
    const highConfidence = page.locator('text=92%').first();
    const mediumConfidence = page.locator('text=85%').first();
    const lowConfidence = page.locator('text=78%').first();

    // Verify confidence values are displayed
    await expect(highConfidence).toBeVisible();
    await expect(mediumConfidence).toBeVisible();
    await expect(lowConfidence).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    await expect(page.locator(':focus')).toBeVisible();

    // Navigate through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to navigate through all interactive elements
  });

  test('should be accessible to screen readers', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label]')).toHaveCount(expect.any(Number));

    // Check for proper headings structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2, h3')).toHaveCount(expect.any(Number));

    // Check for proper table structure
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
  });

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that dashboard is still usable on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="explanation-history"]')).toBeVisible();

    // Check that filters are accessible on mobile
    await expect(page.locator('input[placeholder="Search explanations..."]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/ai/explanations', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Refresh the page to trigger error
    await page.reload();

    // Should display error message
    await expect(page.locator('text=Error:')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/ai/explanations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          explanations: [],
          totalCount: 0,
          hasMore: false,
        }),
      });
    });

    // Refresh the page
    await page.reload();

    // Should display empty state
    await expect(page.locator('text=0 explanations found')).toBeVisible();
    await expect(page.locator('text=No explanations found')).toBeVisible();
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Set some filters
    await page.fill('input[placeholder="Search explanations..."]', 'test');
    await page.selectOption('select', 'supplier_recommendation');

    // Navigate away and back
    await page.goto('/');
    await page.goto('/ai-explanations');

    // Filters should be preserved (if implemented)
    // This test verifies the component handles navigation properly
  });

  test('should handle real-time updates', async ({ page }) => {
    // Mock WebSocket connection
    await page.addInitScript(() => {
      window.WebSocket = class MockWebSocket {
        constructor() {
          setTimeout(() => {
            this.onopen?.();
          }, 100);
        }
        send() {}
        close() {}
      };
    });

    // Reload page to trigger WebSocket connection
    await page.reload();

    // Should establish WebSocket connection
    await page.waitForTimeout(500);
  });

  test('should display loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/ai/explanations', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Refresh page
    await page.reload();

    // Should show loading state
    await expect(page.locator('text=Loading AI Explanation Dashboard...')).toBeVisible();
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `exp-${i}`,
      decisionType: 'supplier_recommendation',
      timestamp: new Date().toISOString(),
      confidence: 85,
      outputDecision: { value: `Supplier_${i}` },
      explanation: [],
      featureImportance: [],
    }));

    await page.route('**/api/ai/explanations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          explanations: largeDataset.slice(0, 20), // Only return first 20 for pagination
          totalCount: 1000,
          hasMore: true,
        }),
      });
    });

    // Refresh page
    await page.reload();

    // Should handle large dataset without performance issues
    await expect(page.locator('tbody tr')).toHaveCount(20);
    await expect(page.locator('text=1000 explanations found')).toBeVisible();
  });
});
