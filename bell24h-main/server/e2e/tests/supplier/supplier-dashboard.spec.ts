import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { SupplierPage } from '../../pages/supplier.page';
import { APIHelpers } from '../../api-helpers';
import { createTestRFQ, createTestSupplier } from '../../test-utils';

test.describe('Supplier Dashboard', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let supplierPage: SupplierPage;
  let api: APIHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    supplierPage = new SupplierPage(page);
    api = new APIHelpers();

    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();
  });

  test('should display supplier statistics', async ({ page }) => {
    // Create test suppliers
    const supplierData = {
      name: 'Test Supplier',
      email: 'supplier@example.com',
      specialties: ['electronics']
    };

    const supplierId = await createTestSupplier(page, {
      ...supplierData,
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India'
      }
    });

    // Create RFQs for the supplier
    const rfqData = {
      productName: 'Electronic Component',
      description: 'Test RFQ',
      quantity: 100,
      targetPrice: 1000,
      unit: 'units',
      category: 'electronics'
    };

    const rfqId = await createTestRFQ(page, rfqData);

    // Navigate to supplier dashboard
    await page.getByRole('link', { name: /supplier dashboard/i }).click();
    await page.waitForURL('/supplier/dashboard');

    // Verify statistics
    const stats = await page.getByRole('heading', { name: /supplier statistics/i });
    await expect(stats).toBeVisible();

    // Verify RFQ count
    const rfqCount = await page.getByText('Total RFQs: 1');
    await expect(rfqCount).toBeVisible();

    // Verify active status
    const status = await page.getByText('Status: Active');
    await expect(status).toBeVisible();

    // Verify specialties
    const specialties = await page.getByText('Specialties: electronics');
    await expect(specialties).toBeVisible();
  });

  test('should display supplier matches', async ({ page }) => {
    // Create test suppliers
    const supplierData = {
      name: 'Test Supplier',
      email: 'supplier@example.com',
      specialties: ['electronics']
    };

    const supplierId = await createTestSupplier(page, {
      ...supplierData,
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India'
      }
    });

    // Create RFQs for the supplier
    const rfqData = {
      productName: 'Electronic Component',
      description: 'Test RFQ',
      quantity: 100,
      targetPrice: 1000,
      unit: 'units',
      category: 'electronics'
    };

    const rfqId = await createTestRFQ(page, rfqData);

    // Match supplier with RFQ
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Navigate to supplier dashboard
    await page.getByRole('link', { name: /supplier dashboard/i }).click();
    await page.waitForURL('/supplier/dashboard');

    // Verify matches section
    const matches = await page.getByRole('heading', { name: /matches/i });
    await expect(matches).toBeVisible();

    // Verify match details
    const matchRow = await page.getByRole('row').filter({ hasText: rfqData.productName });
    await expect(matchRow).toBeVisible();

    const status = await matchRow.getByRole('cell').nth(2).textContent();
    await expect(status).toBe('matched');
  });

  test('should handle supplier notifications', async ({ page }) => {
    // Create test suppliers
    const supplierData = {
      name: 'Test Supplier',
      email: 'supplier@example.com',
      specialties: ['electronics']
    };

    const supplierId = await createTestSupplier(page, {
      ...supplierData,
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India'
      }
    });

    // Create RFQs for the supplier
    const rfqData = {
      productName: 'Electronic Component',
      description: 'Test RFQ',
      quantity: 100,
      targetPrice: 1000,
      unit: 'units',
      category: 'electronics'
    };

    const rfqId = await createTestRFQ(page, rfqData);

    // Match supplier with RFQ
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Navigate to supplier dashboard
    await page.getByRole('link', { name: /supplier dashboard/i }).click();
    await page.waitForURL('/supplier/dashboard');

    // Verify notifications
    const notifications = await page.getByRole('heading', { name: /notifications/i });
    await expect(notifications).toBeVisible();

    // Verify notification content
    const notification = await page.getByText('New RFQ match available');
    await expect(notification).toBeVisible();

    // Mark notification as read
    await page.getByRole('button', { name: /mark as read/i }).click();
    await page.getByText('Notification marked as read').waitFor();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
