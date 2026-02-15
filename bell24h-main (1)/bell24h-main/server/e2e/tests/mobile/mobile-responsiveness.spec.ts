import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { RFQPage } from '../../pages/rfq.page';
import { SupplierPage } from '../../pages/supplier.page';
import { APIHelpers } from '../../api-helpers';
import { createTestRFQ, createTestSupplier } from '../../test-utils';

test.describe('Mobile Responsiveness', () => {
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

    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();
  });

  test('should handle mobile view on iPhone', async ({ page }) => {
    // Set viewport to iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    // Verify login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    // Verify dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Verify navigation
    const navMenu = await page.getByRole('button', { name: /menu/i });
    await expect(navMenu).toBeVisible();
    await navMenu.click();

    // Verify responsive menu
    const menuItems = await page.getByRole('menuitem');
    await expect(menuItems).toHaveCount(5);
  });

  test('should handle tablet view on iPad', async ({ page }) => {
    // Set viewport to iPad
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify dashboard layout
    await page.goto('/dashboard');
    
    // Verify grid layout
    const cards = await page.getByRole('card');
    await expect(cards).toHaveCount(4);
    
    // Verify navigation
    const navMenu = await page.getByRole('button', { name: /menu/i });
    await expect(navMenu).toBeVisible();
    await navMenu.click();

    // Verify responsive menu
    const menuItems = await page.getByRole('menuitem');
    await expect(menuItems).toHaveCount(5);
  });

  test('should handle RTL languages', async ({ page }) => {
    // Set viewport to iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    // Set language to Arabic
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    });

    // Verify login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /تسجيل الدخول/i })).toBeVisible();

    // Verify text direction
    const emailInput = await page.getByLabel('البريد الإلكتروني');
    await expect(emailInput).toBeVisible();

    // Verify RTL navigation
    await page.goto('/dashboard');
    const navMenu = await page.getByRole('button', { name: /قائمة/i });
    await expect(navMenu).toBeVisible();
  });

  test('should handle supplier form on mobile', async ({ page }) => {
    // Set viewport to iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to suppliers
    await page.goto('/suppliers');
    await page.getByRole('button', { name: /create supplier/i }).click();

    // Verify form layout
    const form = await page.getByRole('form');
    await expect(form).toBeVisible();

    // Verify input fields
    const nameInput = await page.getByLabel('اسم المورد');
    await expect(nameInput).toBeVisible();

    const emailInput = await page.getByLabel('البريد الإلكتروني');
    await expect(emailInput).toBeVisible();

    // Verify address fields
    const addressFields = await page.getByLabel('العنوان');
    await expect(addressFields).toHaveCount(5);

    // Verify specialties
    const specialties = await page.getByLabel('التخصصات');
    await expect(specialties).toBeVisible();

    // Verify submit button
    const submitButton = await page.getByRole('button', { name: /حفظ/i });
    await expect(submitButton).toBeVisible();
  });

  test('should handle RFQ form on mobile', async ({ page }) => {
    // Set viewport to iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to RFQs
    await page.goto('/rfqs');
    await page.getByRole('button', { name: /create rfq/i }).click();

    // Verify form layout
    const form = await page.getByRole('form');
    await expect(form).toBeVisible();

    // Verify input fields
    const titleInput = await page.getByLabel('عنوان الطلب');
    await expect(titleInput).toBeVisible();

    const quantityInput = await page.getByLabel('الكمية');
    await expect(quantityInput).toBeVisible();

    // Verify unit selection
    const unitSelect = await page.getByLabel('الوحدة');
    await expect(unitSelect).toBeVisible();

    // Verify category selection
    const categorySelect = await page.getByLabel('الفئة');
    await expect(categorySelect).toBeVisible();

    // Verify submit button
    const submitButton = await page.getByRole('button', { name: /حفظ/i });
    await expect(submitButton).toBeVisible();
  });

  test('should handle pagination on mobile', async ({ page }) => {
    // Create test data
    const suppliers = Array.from({ length: 20 }, (_, i) => ({
      name: `Supplier ${i + 1}`,
      specialties: ['electronics']
    }));

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

    // Set viewport to iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to suppliers
    await page.goto('/suppliers');

    // Verify pagination
    const pagination = await page.getByRole('navigation', { name: /pagination/i });
    await expect(pagination).toBeVisible();

    // Verify page numbers
    const pageNumbers = await pagination.getByRole('button');
    await expect(pageNumbers).toHaveCount(5);

    // Navigate pages
    await pageNumbers.nth(1).click();
    await expect(page.getByText('Supplier 6')).toBeVisible();

    await pageNumbers.nth(2).click();
    await expect(page.getByText('Supplier 11')).toBeVisible();
  });

  test('should handle notifications on mobile', async ({ page }) => {
    // Create test RFQ
    const rfqData = {
      title: 'Test RFQ',
      quantity: 100,
      unit: 'units',
      category: 'electronics'
    };
    const rfqId = await createTestRFQ(page, rfqData);

    // Set viewport to iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to notifications
    await page.goto('/notifications');

    // Verify notifications list
    const notifications = await page.getByRole('listitem');
    await expect(notifications).toBeVisible();

    // Verify notification details
    const notification = await notifications.nth(0);
    await expect(notification.getByText('New RFQ')).toBeVisible();
    await expect(notification.getByText('electronics')).toBeVisible();

    // Verify mark as read
    const markRead = await notification.getByRole('button', { name: /mark as read/i });
    await expect(markRead).toBeVisible();
    await markRead.click();

    // Verify notification marked as read
    const readStatus = await notification.getByText('Read');
    await expect(readStatus).toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
