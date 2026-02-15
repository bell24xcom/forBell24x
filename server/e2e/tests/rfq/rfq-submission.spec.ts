import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { RFQPage } from '../../pages/rfq.page';
import { APIHelpers } from '../../api-helpers';
import { createTestRFQ, createTestSupplier, updateRFQStatus } from '../../test-utils';

test.describe('RFQ Submission and Supplier Matching', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let rfqPage: RFQPage;
  let api: APIHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    rfqPage = new RFQPage(page);
    api = new APIHelpers();

    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();
  });

  test('should submit RFQ with minimum required fields', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Create RFQ with minimum fields
    await rfqPage.clickCreateRFQ();
    await rfqPage.fillRFQForm({
      title: 'Test RFQ',
      description: 'Test RFQ description',
      quantity: 1,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    });
    await rfqPage.submitRFQ();

    // Verify RFQ creation
    await expect(page.getByText('RFQ created successfully')).toBeVisible();
  });

  test('should validate RFQ form fields', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Submit empty form
    await rfqPage.clickCreateRFQ();
    await rfqPage.submitRFQ();

    // Verify validation errors
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Quantity is required')).toBeVisible();
    await expect(page.getByText('Delivery date is required')).toBeVisible();

    // Fill invalid data
    await rfqPage.fillRFQForm({
      title: '',
      description: 'Test',
      quantity: -1,
      unit: 'invalid',
      deliveryDate: 'invalid-date'
    });
    await rfqPage.submitRFQ();

    // Verify invalid data errors
    await expect(page.getByText('Title cannot be empty')).toBeVisible();
    await expect(page.getByText('Quantity must be positive')).toBeVisible();
    await expect(page.getByText('Invalid unit type')).toBeVisible();
    await expect(page.getByText('Invalid date format')).toBeVisible();
  });

  test('should handle RFQ submission with attachments', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Create RFQ with attachment
    await rfqPage.clickCreateRFQ();
    await rfqPage.fillRFQForm({
      title: 'Test RFQ with Attachment',
      description: 'RFQ with attachment',
      quantity: 100,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Upload test file
    const fileInput = page.getByLabel('Attachments');
    await fileInput.setInputFiles('test.pdf');

    await rfqPage.submitRFQ();

    // Verify RFQ creation and attachment
    await expect(page.getByText('RFQ created successfully')).toBeVisible();
    await expect(page.getByText('test.pdf')).toBeVisible();
  });

  test('should handle RFQ status updates', async ({ page }) => {
    // Create test RFQ
    const rfqData = {
      title: 'Test RFQ',
      description: 'Test RFQ description',
      quantity: 100,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    const rfqId = await createTestRFQ(page, rfqData);

    // Update RFQ status
    await updateRFQStatus(page, rfqId, 'approved');

    // Verify status update
    await page.goto(`/rfqs/${rfqId}`);
    const status = await page.getByText('Status: Approved');
    await expect(status).toBeVisible();

    // Update to completed
    await updateRFQStatus(page, rfqId, 'completed');
    const completedStatus = await page.getByText('Status: Completed');
    await expect(completedStatus).toBeVisible();
  });

  test('should handle RFQ matching with multiple suppliers', async ({ page }) => {
    // Create multiple suppliers
    const suppliers = [
      {
        name: 'Supplier A',
        specialties: ['electronics']
      },
      {
        name: 'Supplier B',
        specialties: ['electronics']
      }
    ];

    for (const supplier of suppliers) {
      await createTestSupplier(page, {
        ...supplier,
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zip: '123456',
          country: 'India'
        }
      });
    }

    // Create RFQ
    const rfqData = {
      title: 'Test RFQ',
      description: 'Test RFQ description',
      quantity: 100,
      unit: 'units',
      category: 'electronics',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    const rfqId = await createTestRFQ(page, rfqData);

    // Match suppliers
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify multiple matches
    const matchedSuppliers = await page.getByRole('row').filter({ hasText: /matched/i });
    await expect(matchedSuppliers).toHaveCount(2);
  });

  test('should handle RFQ matching with no suppliers', async ({ page }) => {
    // Create RFQ with no matching suppliers
    const rfqData = {
      title: 'Test RFQ',
      description: 'Test RFQ description',
      quantity: 100,
      unit: 'units',
      category: 'non-existent-category',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    const rfqId = await createTestRFQ(page, rfqData);

    // Match suppliers
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify no matches
    const noMatches = await page.getByText('No matching suppliers found');
    await expect(noMatches).toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
