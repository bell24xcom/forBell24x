import { test, expect } from '@playwright/test';

test.describe('RFQ Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new RFQ', async ({ page }) => {
    // Navigate to RFQ creation
    await page.click('[data-testid="create-rfq-button"]');
    await page.waitForURL('/rfq/create');

    // Fill RFQ details
    await page.fill('[data-testid="rfq-title"]', 'Test RFQ');
    await page.fill('[data-testid="rfq-description"]', 'This is a test RFQ description');
    await page.selectOption('[data-testid="rfq-category"]', 'agriculture');
    await page.selectOption('[data-testid="rfq-subcategory"]', 'seeds');
    await page.fill('[data-testid="rfq-quantity"]', '100');
    await page.fill('[data-testid="rfq-budget"]', '1000');
    await page.fill('[data-testid="rfq-timeline"]', '30 days');

    // Submit RFQ
    await page.click('[data-testid="submit-rfq-button"]');
    await page.waitForURL('/rfq/*');

    // Verify RFQ creation
    await expect(page.locator('[data-testid="rfq-status"]')).toHaveText('Active');
    await expect(page.locator('[data-testid="rfq-title"]')).toHaveText('Test RFQ');
  });

  test('should edit an existing RFQ', async ({ page }) => {
    // Navigate to RFQ list
    await page.click('[data-testid="rfq-list-button"]');
    await page.waitForURL('/rfq/list');

    // Click on first RFQ
    await page.click('[data-testid="rfq-item"]');
    await page.waitForURL('/rfq/*');

    // Click edit button
    await page.click('[data-testid="edit-rfq-button"]');

    // Update RFQ details
    await page.fill('[data-testid="rfq-title"]', 'Updated RFQ Title');
    await page.fill('[data-testid="rfq-description"]', 'Updated description');
    await page.click('[data-testid="save-rfq-button"]');

    // Verify updates
    await expect(page.locator('[data-testid="rfq-title"]')).toHaveText('Updated RFQ Title');
    await expect(page.locator('[data-testid="rfq-description"]')).toHaveText('Updated description');
  });

  test('should delete an RFQ', async ({ page }) => {
    // Navigate to RFQ list
    await page.click('[data-testid="rfq-list-button"]');
    await page.waitForURL('/rfq/list');

    // Click on first RFQ
    await page.click('[data-testid="rfq-item"]');
    await page.waitForURL('/rfq/*');

    // Click delete button and confirm
    await page.click('[data-testid="delete-rfq-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify deletion
    await page.waitForURL('/rfq/list');
    await expect(page.locator('[data-testid="rfq-item"]')).toHaveCount(0);
  });

  test('should filter RFQs by category', async ({ page }) => {
    // Navigate to RFQ list
    await page.click('[data-testid="rfq-list-button"]');
    await page.waitForURL('/rfq/list');

    // Select category filter
    await page.selectOption('[data-testid="category-filter"]', 'agriculture');

    // Verify filtered results
    const rfqItems = await page.locator('[data-testid="rfq-item"]').all();
    for (const item of rfqItems) {
      const category = await item.locator('[data-testid="rfq-category"]').textContent();
      expect(category).toBe('Agriculture');
    }
  });

  test('should search RFQs', async ({ page }) => {
    // Navigate to RFQ list
    await page.click('[data-testid="rfq-list-button"]');
    await page.waitForURL('/rfq/list');

    // Enter search term
    await page.fill('[data-testid="search-input"]', 'Test RFQ');

    // Verify search results
    const rfqItems = await page.locator('[data-testid="rfq-item"]').all();
    for (const item of rfqItems) {
      const title = await item.locator('[data-testid="rfq-title"]').textContent();
      expect(title).toContain('Test RFQ');
    }
  });
}); 