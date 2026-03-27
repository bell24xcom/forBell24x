import { test, expect, type Page } from '@playwright/test';
import { loginAsAdmin } from './test-utils';

// Test suite for the application's basic functionality
test.describe('Application Basic Flows', () => {
  // Test case: Verify the application loads
  test('should load the application', async ({ page }) => {
    await test.step('Navigate to the home page', async () => {
      await page.goto('http://localhost:3001');
    });
    
    await test.step('Verify page title', async () => {
      await expect(page).toHaveTitle(/Bell24H Dashboard/);
    });
  });

  // Test case: Verify login functionality
  test('should allow admin login', async ({ page }) => {
    await test.step('Login as admin', async () => {
      await loginAsAdmin(page);
    });
    
    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.getByText('Welcome, Admin')).toBeVisible();
    });
  });

  // Test case: Verify navigation to dashboard
  test('should navigate to dashboard', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('http://localhost:3001/dashboard');
    });
    
    await test.step('Verify dashboard page', async () => {
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });
  });

  // Test case: Verify navigation to RFQ page
  test('should navigate to RFQ page', async ({ page }) => {
    await test.step('Navigate to home page', async () => {
      await page.goto('http://localhost:3001');
    });
    
    await test.step('Click on RFQs link in navigation', async () => {
      await page.getByRole('link', { name: /RFQs/i }).click();
    });
    
    await test.step('Verify RFQ page is loaded', async () => {
      await expect(page).toHaveURL(/.*rfqs/i);
      await expect(page.getByRole('heading', { name: /RFQs/i })).toBeVisible();
    });
  });
});
