import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { SupplierPage } from '../../pages/supplier.page';
import { APIHelpers } from '../../api-helpers';
import { createTestSupplier } from '../../test-utils';

test.describe('Supplier Registration', () => {
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

  test('should register a new supplier successfully', async ({ page }) => {
    // Navigate to suppliers page
    await page.getByRole('link', { name: /suppliers/i }).click();
    await supplierPage.waitForLoad();

    // Click create supplier
    await supplierPage.clickCreateSupplier();

    // Fill supplier form
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
      specialties: ['electronics', 'hardware'],
      rating: 4.5,
      status: 'active'
    };

    await supplierPage.fillSupplierForm(supplierData);
    await supplierPage.submitSupplierForm();

    // Verify success message
    await expect(page.getByText('Supplier created successfully')).toBeVisible();

    // Verify supplier appears in list
    const supplierRow = await page.getByRole('row').filter({ hasText: supplierData.name });
    await expect(supplierRow).toBeVisible();

    // Verify supplier details
    const status = await supplierRow.getByRole('cell').nth(3).textContent();
    await expect(status).toBe('active');

    const rating = await supplierRow.getByRole('cell').nth(4).textContent();
    await expect(rating).toBe('4.5');
  });

  test('should validate supplier form fields', async ({ page }) => {
    // Navigate to suppliers page
    await page.getByRole('link', { name: /suppliers/i }).click();
    await supplierPage.waitForLoad();

    // Click create supplier
    await supplierPage.clickCreateSupplier();

    // Submit empty form
    await supplierPage.submitSupplierForm();

    // Verify validation errors
    const errors = await page.getByRole('alert');
    await expect(errors).toBeVisible();

    // Verify specific error messages
    const nameError = await page.getByText('Name is required');
    await expect(nameError).toBeVisible();

    const emailError = await page.getByText('Email is required');
    await expect(emailError).toBeVisible();

    // Fill invalid data
    await supplierPage.fillSupplierForm({
      name: '',
      email: 'invalid-email',
      phone: '123',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      specialties: [],
      rating: -1,
      status: ''
    });

    await supplierPage.submitSupplierForm();

    // Verify validation messages
    const invalidEmailError = await page.getByText('Invalid email format');
    await expect(invalidEmailError).toBeVisible();

    const invalidPhoneError = await page.getByText('Invalid phone number');
    await expect(invalidPhoneError).toBeVisible();

    const invalidRatingError = await page.getByText('Rating must be between 0 and 5');
    await expect(invalidRatingError).toBeVisible();
  });

  test('should update supplier information', async ({ page }) => {
    // Create a supplier first
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
      rating: 4.0,
      status: 'active'
    };

    const supplierId = await createTestSupplier(page, supplierData);

    // Update supplier
    const updates = {
      name: 'Updated Supplier',
      email: 'updated@example.com',
      phone: '9876543210',
      address: {
        street: '456 Updated St',
        city: 'Updated City',
        state: 'Updated State',
        zip: '654321',
        country: 'India'
      },
      specialties: ['electronics', 'software'],
      rating: 4.5,
      status: 'inactive'
    };

    await supplierPage.updateSupplier(supplierId, updates);

    // Verify updates
    const supplierRow = await page.getByRole('row').filter({ hasText: updates.name });
    await expect(supplierRow).toBeVisible();

    const status = await supplierRow.getByRole('cell').nth(3).textContent();
    await expect(status).toBe('inactive');

    const rating = await supplierRow.getByRole('cell').nth(4).textContent();
    await expect(rating).toBe('4.5');
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
