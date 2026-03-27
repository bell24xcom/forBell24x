import { test, expect } from '@playwright/test';

test.describe('Bell24H - Explanation History E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the explainability admin page
    await page.goto('/admin/explainability');
    await page.waitForLoadState('networkidle');
  });

  test('should display explanation history page title correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Explanation History/);
    const headerTitle = await page.locator('h1').first();
    await expect(headerTitle).toContainText(/Explanation History/);
  });

  test('should display explanation history items', async ({ page }) => {
    // Wait for the explanation items to load
    await page.waitForSelector('.explanation-item');
    
    // Check if at least one explanation item exists
    const items = await page.locator('.explanation-item').count();
    expect(items).toBeGreaterThan(0);
  });

  test('should allow filtering by model type', async ({ page }) => {
    // Check if filter dropdown exists
    const filterDropdown = page.locator('#model-filter');
    await expect(filterDropdown).toBeVisible();
    
    // Select SHAP model type
    await page.selectOption('#model-filter', { label: 'SHAP' });
    await page.waitForResponse(resp => resp.url().includes('/api/explanations/history') && resp.status() === 200);
    
    // Wait for filtered items to load
    await page.waitForSelector('.explanation-item');
    
    // Get the model types after filtering
    const modelTypes = await page.locator('.model-type-cell').allInnerTexts();
    
    // Check if all items are SHAP models
    for (const type of modelTypes) {
      expect(type.toLowerCase()).toContain('shap');
    }
  });

  test('should paginate results correctly', async ({ page }) => {
    // Check pagination controls
    await expect(page.locator('.MuiPagination-root')).toBeVisible();
    
    // Get initial page content
    const initialItems = await page.locator('.explanation-item').allInnerTexts();
    
    // Go to next page if available
    const nextButton = page.locator('button[aria-label="Go to next page"]');
    
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForResponse(resp => resp.url().includes('/api/explanations/history') && resp.status() === 200);
      
      // Get new page content
      const newPageItems = await page.locator('.explanation-item').allInnerTexts();
      
      // Content should be different after pagination
      expect(JSON.stringify(initialItems)).not.toEqual(JSON.stringify(newPageItems));
      
      // Check page number indicator
      const paginationText = await page.locator('.MuiTablePagination-displayedRows').textContent();
      expect(paginationText).toContain('2');
    }
  });

  test('should export explanations correctly', async ({ page }) => {
    // Check if export button exists
    const exportButton = page.locator('#export-button');
    await expect(exportButton).toBeVisible();
    
    // Click export button
    await exportButton.click();
    
    // Select export format
    await page.selectOption('#export-format', { value: 'json' });
    
    // Start download by clicking download button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#download-export').click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download started and has correct format
    expect(await download.suggestedFilename()).toContain('.json');
  });

  test('should show explanation details when item is clicked', async ({ page }) => {
    // Click on the first explanation item
    await page.locator('.explanation-item').first().click();
    
    // Check if details modal/drawer appears
    await expect(page.locator('.explanation-details-modal')).toBeVisible();
    
    // Verify details content
    await expect(page.locator('.explanation-details-modal')).toContainText('Model Used');
    await expect(page.locator('.explanation-details-modal')).toContainText('Summary');
    await expect(page.locator('.explanation-details-modal')).toContainText('Details');
    
    // Close the modal if there's a close button
    const closeButton = page.locator('.close-details-button');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(page.locator('.explanation-details-modal')).not.toBeVisible();
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/explanations/history**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 } })
      });
    });
    
    // Reload page with empty data
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check for empty state message
    const emptyState = page.locator('.empty-state-message');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/No explanations found/i);
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Mock error response
    await page.route('**/api/explanations/history**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check for error message
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/error/i);
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // This is a basic check - in practice, you would use Playwright's accessibility testing capabilities
    // or integrate with tools like axe-core
    
    // Check for basic accessibility attributes
    await expect(page.locator('table')).toHaveAttribute('role', 'table');
    await expect(page.locator('th').first()).toHaveAttribute('scope', 'col');
    
    // Check that interactive elements are properly accessible
    const filterDropdown = page.locator('#model-filter');
    await expect(filterDropdown).toHaveAttribute('aria-label');
    
    // Check pagination buttons for accessibility
    const paginationButtons = page.locator('.MuiPagination-ul button');
    await expect(paginationButtons.first()).toHaveAttribute('aria-label');
  });
});
