import { test, expect, chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { loginAsAdmin, createTestRFQ, deleteTestRFQ } from './test-utils';

// Test data
const testRFQ = {
  productName: 'Test Product ' + Date.now(),
  description: 'Test Description',
  quantity: 10,
  targetPrice: 100.50
};

// Test suite for RFQ functionality
test.describe('RFQ Management', () => {
  // Store RFQ ID between tests
  let rfqId: string | undefined;
  let testPage: Page | null = null;

  // Setup before each test
  test.beforeEach(async ({ page }) => {
    testPage = page;
  });

  // Setup before all tests in this suite
  test.beforeAll(async () => {
    const browser = await chromium.launch({
      headless: false, // Set to true for CI
      slowMo: 100, // Slow down by 100ms for each action
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    // Log in before running tests
    await loginAsAdmin(page);
  });

  // Test case: Navigate to RFQ page
  test('should navigate to RFQ page', async ({ page }) => {
    await page.goto('http://localhost:3001/rfqs');
    await expect(page).toHaveURL(/.*rfqs/);
    await expect(page.getByRole('heading', { name: /RFQs/i })).toBeVisible();
  });

  // Test case: Create a new RFQ
  test('should create a new RFQ', async ({ page }) => {
    await test.step('Login as admin', async () => {
      await loginAsAdmin(page);
    });
    
    await test.step('Create a new RFQ', async () => {
      rfqId = await createTestRFQ(page, testRFQ);
    });
    
    await test.step('Verify RFQ creation success', async () => {
      await expect(page.getByText('RFQ created successfully')).toBeVisible();
      await expect(page.getByText(testRFQ.productName)).toBeVisible();
    });
  });

  // Test case: View RFQ details
  test('should view RFQ details', async ({ page }) => {
    // Skip if no RFQ ID is available
    if (!rfqId) {
      test.skip(true, 'RFQ ID is not available');
      return;
    }
    
    await test.step('Login as admin', async () => {
      await loginAsAdmin(page);
    });
    
    await test.step(`Navigate to RFQ details page for ID: ${rfqId}`, async () => {
      await page.goto(`http://localhost:3001/rfqs/${rfqId}`);
    });
    
    await test.step('Verify RFQ details are displayed', async () => {
      await expect(page.getByText(testRFQ.productName)).toBeVisible();
      await expect(page.getByText(testRFQ.description)).toBeVisible();
      await expect(page.getByText(testRFQ.quantity.toString())).toBeVisible();
      await expect(page.getByText(testRFQ.targetPrice.toString())).toBeVisible();
    });
  });

  // Test case: Delete an RFQ
  test('should delete an RFQ', async ({ page }) => {
    test.skip(!rfqId, 'RFQ ID is not available');
    if (!rfqId) return;
    
    await test.step('Login as admin', async () => {
      await loginAsAdmin(page);
    });
    
    await test.step('Delete the RFQ', async () => {
      await deleteTestRFQ(page, rfqId);
    });
    
    await test.step('Verify RFQ was deleted', async () => {
      await expect(page.getByText('RFQ deleted successfully')).toBeVisible();
    });
    
    // Clear the RFQ ID since it's been deleted
    rfqId = null;
  });

  // Cleanup after each test
  test.afterEach(async () => {
    // Clean up test data if it exists
    const currentRfqId = rfqId;
    const currentPage = testPage;
    
    if (currentRfqId && currentPage) {
      try {
        await loginAsAdmin(currentPage);
        await deleteTestRFQ(currentPage, currentRfqId);
      } catch (error) {
        // Log error but don't fail the test
        process.stderr.write(`Error cleaning up test RFQ: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      } finally {
        rfqId = undefined;
      }
    }
    testPage = null;
  });
});
