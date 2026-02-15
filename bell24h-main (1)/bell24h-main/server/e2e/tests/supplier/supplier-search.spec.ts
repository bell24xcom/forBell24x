import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { SupplierPage } from '../../pages/supplier.page';
import { APIHelpers } from '../../api-helpers';
import { createTestSupplier } from '../../test-utils';

test.describe('Supplier Search and Filtering', () => {
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

  test('should search suppliers by name', async ({ page }) => {
    // Create test suppliers
    const suppliers = [
      {
        name: 'Supplier A',
        email: 'supplier-a@example.com',
        specialties: ['electronics']
      },
      {
        name: 'Supplier B',
        email: 'supplier-b@example.com',
        specialties: ['software']
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

    // Navigate to suppliers page
    await page.getByRole('link', { name: /suppliers/i }).click();
    await supplierPage.waitForLoad();

    // Search for Supplier A
    await page.getByPlaceholder('Search suppliers...').fill('Supplier A');
    await page.keyboard.press('Enter');

    // Verify only Supplier A is shown
    const supplierRows = await page.getByRole('row');
    await expect(supplierRows).toHaveCount(1);
    await expect(supplierRows.getByText('Supplier A')).toBeVisible();
  });

  test('should filter suppliers by status', async ({ page }) => {
    // Create suppliers with different statuses
    const suppliers = [
      {
        name: 'Active Supplier',
        status: 'active',
        specialties: ['electronics']
      },
      {
        name: 'Inactive Supplier',
        status: 'inactive',
        specialties: ['software']
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

    // Navigate to suppliers page
    await page.getByRole('link', { name: /suppliers/i }).click();
    await supplierPage.waitForLoad();

    // Filter by active suppliers
    await page.getByLabel('Status').selectOption('active');

    // Verify only active supplier is shown
    const supplierRows = await page.getByRole('row');
    await expect(supplierRows).toHaveCount(1);
    await expect(supplierRows.getByText('Active Supplier')).toBeVisible();
  });

  test('should filter suppliers by specialties', async ({ page }) => {
    // Create suppliers with different specialties
    const suppliers = [
      {
        name: 'Electronics Supplier',
        specialties: ['electronics']
      },
      {
        name: 'Software Supplier',
        specialties: ['software']
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

    // Navigate to suppliers page
    await page.getByRole('link', { name: /suppliers/i }).click();
    await supplierPage.waitForLoad();

    // Filter by electronics specialty
    await page.getByLabel('Specialties').selectOption('electronics');

    // Verify only electronics supplier is shown
    const supplierRows = await page.getByRole('row');
    await expect(supplierRows).toHaveCount(1);
    await expect(supplierRows.getByText('Electronics Supplier')).toBeVisible();
  });

  test('should sort suppliers by rating', async ({ page }) => {
    // Create suppliers with different ratings
    const suppliers = [
      {
        name: 'High Rating Supplier',
        rating: 4.5,
        specialties: ['electronics']
      },
      {
        name: 'Low Rating Supplier',
        rating: 3.0,
        specialties: ['software']
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

    // Navigate to suppliers page
    await page.getByRole('link', { name: /suppliers/i }).click();
    await supplierPage.waitForLoad();

    // Sort by rating (descending)
    await page.getByRole('button', { name: /sort by rating/i }).click();

    // Verify suppliers are sorted correctly
    const supplierRows = await page.getByRole('row');
    const firstRow = await supplierRows.nth(0).getByRole('cell').nth(4).textContent();
    await expect(firstRow).toBe('4.5');
    const secondRow = await supplierRows.nth(1).getByRole('cell').nth(4).textContent();
    await expect(secondRow).toBe('3.0');
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
