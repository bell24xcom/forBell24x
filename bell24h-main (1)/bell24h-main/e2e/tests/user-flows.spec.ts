import { test, expect } from '@playwright/test';

test.describe('User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login as test user
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('Complete RFQ Creation Flow', async ({ page }) => {
    // Navigate to RFQ creation
    await page.click('text=Create RFQ');
    await page.waitForURL('/rfq/create');

    // Fill RFQ details
    await page.fill('input[name="title"]', 'Test RFQ');
    await page.fill('textarea[name="description"]', 'Detailed description for testing');
    await page.selectOption('select[name="category"]', 'Electronics');
    await page.fill('input[name="quantity"]', '100');
    await page.fill('input[name="budget"]', '5000');
    await page.fill('input[name="deliveryDeadline"]', '2024-12-31');

    // Submit RFQ
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('text=RFQ created successfully')).toBeVisible();

    // Verify RFQ appears in list
    await page.goto('/rfq/list');
    await expect(page.locator('text=Test RFQ')).toBeVisible();
  });

  test('Supplier Registration and Profile Setup', async ({ page }) => {
    // Navigate to supplier registration
    await page.goto('/supplier/register');

    // Fill registration form
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="email"]', 'supplier@test.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.fill('textarea[name="address"]', '123 Test Street');

    // Submit registration
    await page.click('button[type="submit"]');

    // Verify success and navigate to profile setup
    await page.waitForURL('/supplier/profile/setup');

    // Complete profile setup
    await page.fill('input[name="businessType"]', 'Manufacturer');
    await page.fill('input[name="yearsInBusiness"]', '5');
    await page.selectOption('select[name="certifications"]', ['ISO9001', 'ISO14001']);
    await page.fill('textarea[name="productCategories"]', 'Electronics, Components');

    // Submit profile
    await page.click('button[type="submit"]');

    // Verify profile completion
    await expect(page.locator('text=Profile setup complete')).toBeVisible();
  });

  test('Buyer RFQ Management Flow', async ({ page }) => {
    // Navigate to RFQ management
    await page.goto('/rfq/manage');

    // Create new RFQ
    await page.click('text=Create New RFQ');
    await page.fill('input[name="title"]', 'Managed RFQ');
    await page.fill('textarea[name="description"]', 'RFQ for testing management features');
    await page.selectOption('select[name="category"]', 'Components');
    await page.fill('input[name="quantity"]', '50');
    await page.click('button[type="submit"]');

    // Verify RFQ creation
    await expect(page.locator('text=Managed RFQ')).toBeVisible();

    // Edit RFQ
    await page.click('text=Edit');
    await page.fill('input[name="quantity"]', '75');
    await page.click('button[type="submit"]');

    // Verify update
    await expect(page.locator('text=75 units')).toBeVisible();

    // Delete RFQ
    await page.click('text=Delete');
    await page.click('text=Confirm Delete');

    // Verify deletion
    await expect(page.locator('text=Managed RFQ')).not.toBeVisible();
  });

  test('Quotation Submission and Management', async ({ page }) => {
    // Navigate to RFQ list
    await page.goto('/rfq/list');

    // Find and click on an RFQ
    await page.click('text=Test RFQ');

    // Submit quotation
    await page.click('text=Submit Quotation');
    await page.fill('input[name="price"]', '4500');
    await page.fill('input[name="deliveryTime"]', '30');
    await page.fill('textarea[name="terms"]', 'Standard terms and conditions');
    await page.click('button[type="submit"]');

    // Verify quotation submission
    await expect(page.locator('text=Quotation submitted successfully')).toBeVisible();

    // View quotation details
    await page.click('text=View Quotation');
    await expect(page.locator('text=4500')).toBeVisible();
    await expect(page.locator('text=30 days')).toBeVisible();
  });

  test('Order Creation and Tracking', async ({ page }) => {
    // Navigate to quotations
    await page.goto('/quotations');

    // Select a quotation
    await page.click('text=Accept Quotation');

    // Create order
    await page.fill('input[name="shippingAddress"]', '456 Delivery Street');
    await page.selectOption('select[name="paymentMethod"]', 'escrow');
    await page.click('button[type="submit"]');

    // Verify order creation
    await expect(page.locator('text=Order created successfully')).toBeVisible();

    // Track order
    await page.goto('/orders');
    await page.click('text=Track Order');
    await expect(page.locator('text=Order Status')).toBeVisible();
  });

  test('Escrow Management Flow', async ({ page }) => {
    // Navigate to orders
    await page.goto('/orders');

    // Select an order
    await page.click('text=View Order');

    // Create escrow
    await page.click('text=Create Escrow');
    await page.fill('input[name="amount"]', '4500');
    await page.click('button[type="submit"]');

    // Verify escrow creation
    await expect(page.locator('text=Escrow created successfully')).toBeVisible();

    // Release escrow
    await page.click('text=Release Escrow');
    await page.click('text=Confirm Release');

    // Verify escrow release
    await expect(page.locator('text=Escrow released successfully')).toBeVisible();
  });

  test('Analytics Dashboard Interaction', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/analytics');

    // Check different time periods
    await page.selectOption('select[name="timePeriod"]', 'monthly');
    await expect(page.locator('text=Monthly Analytics')).toBeVisible();

    await page.selectOption('select[name="timePeriod"]', 'yearly');
    await expect(page.locator('text=Yearly Analytics')).toBeVisible();

    // Export data
    await page.click('text=Export Data');
    await page.selectOption('select[name="exportFormat"]', 'csv');
    await page.click('button[type="submit"]');

    // Verify export
    await expect(page.locator('text=Export started')).toBeVisible();
  });

  test('User Profile Management', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');

    // Update profile information
    await page.fill('input[name="name"]', 'Updated Name');
    await page.fill('input[name="phone"]', '+1987654321');
    await page.fill('textarea[name="address"]', '789 New Street');
    await page.click('button[type="submit"]');

    // Verify profile update
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // Change password
    await page.click('text=Change Password');
    await page.fill('input[name="currentPassword"]', 'testpassword');
    await page.fill('input[name="newPassword"]', 'newpassword');
    await page.fill('input[name="confirmPassword"]', 'newpassword');
    await page.click('button[type="submit"]');

    // Verify password change
    await expect(page.locator('text=Password changed successfully')).toBeVisible();
  });
}); 