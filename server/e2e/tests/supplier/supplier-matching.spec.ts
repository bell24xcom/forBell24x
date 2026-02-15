import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { RFQPage } from '../../pages/rfq.page';
import { SupplierPage } from '../../pages/supplier.page';
import { APIHelpers } from '../../api-helpers';
import { createTestRFQ, createTestSupplier, updateRFQStatus } from '../../test-utils';

test.describe('Supplier Matching', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let rfqPage: RFQPage;
  let supplierPage: SupplierPage;
  let api: APIHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    rfqPage = new RFQPage(page);
    supplierPage = new SupplierPage(page);
    api = new APIHelpers();

    // Create test data
    const { user, supplier, rfq } = TestDataFactory.createScenario();
    await api.createUser(user);
    await api.createSupplier(supplier);
    await api.createRFQ(rfq);

    // Login
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();
  });

  test('should match suppliers based on specialties', async ({ page }) => {
    // Create a supplier with specific specialties
    const supplierData = {
      name: 'Test Supplier',
      email: 'supplier@example.com',
      phone: '1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India'
      },
      specialties: ['electronics', 'hardware']
    };

    const supplierId = await createTestSupplier(page, supplierData);

    // Create an RFQ that matches supplier specialties
    const rfqData = {
      productName: 'Electronic Component',
      description: 'Test RFQ for supplier matching',
      quantity: 100,
      targetPrice: 1000,
      unit: 'units',
      category: 'electronics',
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const rfqId = await createTestRFQ(page, rfqData);

    // Navigate to RFQ and match suppliers
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify supplier is matched
    const matchedSuppliers = await page.getByRole('row').filter({ hasText: supplierData.name });
    await expect(matchedSuppliers).toHaveCount(1);

    // Verify match details
    const matchDetails = await matchedSuppliers.getByRole('cell').nth(2).textContent();
    await expect(matchDetails).toContain('electronics');
  });

  test('should handle supplier matching failures', async ({ page }) => {
    // Create a supplier with different specialties
    const supplierData = {
      name: 'Test Supplier',
      email: 'supplier@example.com',
      phone: '1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India'
      },
      specialties: ['furniture', 'clothing']
    };

    const supplierId = await createTestSupplier(page, supplierData);

    // Create an RFQ with different category
    const rfqData = {
      productName: 'Electronic Component',
      description: 'Test RFQ for supplier matching',
      quantity: 100,
      targetPrice: 1000,
      unit: 'units',
      category: 'electronics',
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const rfqId = await createTestRFQ(page, rfqData);

    // Navigate to RFQ and match suppliers
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify no suppliers were matched
    const matchedSuppliers = await page.getByRole('row').filter({ hasText: supplierData.name });
    await expect(matchedSuppliers).toHaveCount(0);

    // Verify error message
    const errorMessage = await page.getByText(/no suppliers found/i).textContent();
    await expect(errorMessage).toBeTruthy();
  });

  test('should handle supplier status changes', async ({ page }) => {
    // Create an active supplier
    const supplierData = {
      name: 'Test Supplier',
      email: 'supplier@example.com',
      phone: '1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India'
      },
      specialties: ['electronics'],
      status: 'active'
    };

    const supplierId = await createTestSupplier(page, supplierData);

    // Create an RFQ
    const rfqData = {
      productName: 'Electronic Component',
      description: 'Test RFQ for supplier matching',
      quantity: 100,
      targetPrice: 1000,
      unit: 'units',
      category: 'electronics',
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const rfqId = await createTestRFQ(page, rfqData);

    // Match suppliers - should succeed
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    const matchedSuppliers = await page.getByRole('row').filter({ hasText: supplierData.name });
    await expect(matchedSuppliers).toHaveCount(1);

    // Deactivate supplier
    await supplierPage.updateSupplier(supplierId, { status: 'inactive' });

    // Try matching again - should fail
    await page.goto(`/rfqs/${rfqId}`);
    await page.getByRole('button', { name: /match suppliers/i }).click();
    await page.getByRole('button', { name: /submit/i }).click();

    const newMatchedSuppliers = await page.getByRole('row').filter({ hasText: supplierData.name });
    await expect(newMatchedSuppliers).toHaveCount(0);
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
