import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login as supplier
    await page.fill('input[name="email"]', 'supplier@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('Supplier Dashboard Accessibility', async ({ page }) => {
    await page.goto('/supplier/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Profile Page Accessibility', async ({ page }) => {
    await page.goto('/supplier/profile');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier RFQ Management Accessibility', async ({ page }) => {
    await page.goto('/supplier/rfq/manage');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Analytics Dashboard Accessibility', async ({ page }) => {
    await page.goto('/supplier/analytics');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Settings Page Accessibility', async ({ page }) => {
    await page.goto('/supplier/settings');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Product Catalog Accessibility', async ({ page }) => {
    await page.goto('/supplier/catalog');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Order Management Accessibility', async ({ page }) => {
    await page.goto('/supplier/orders');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Messaging System Accessibility', async ({ page }) => {
    await page.goto('/supplier/messages');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Notifications Accessibility', async ({ page }) => {
    await page.goto('/supplier/notifications');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Help Center Accessibility', async ({ page }) => {
    await page.goto('/supplier/help');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Form Accessibility', async ({ page }) => {
    await page.goto('/supplier/profile/edit');
    
    // Test form controls
    const formControls = [
      'input[name="companyName"]',
      'input[name="email"]',
      'input[name="phone"]',
      'textarea[name="address"]',
      'select[name="businessType"]',
      'input[name="website"]',
    ];

    for (const control of formControls) {
      const element = await page.locator(control);
      expect(await element.getAttribute('aria-label')).toBeTruthy();
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Table Accessibility', async ({ page }) => {
    await page.goto('/supplier/orders');
    
    // Test table accessibility
    const table = await page.locator('table');
    expect(await table.getAttribute('role')).toBe('table');
    expect(await table.getAttribute('aria-label')).toBeTruthy();

    const headers = await page.locator('th');
    for (const header of await headers.all()) {
      expect(await header.getAttribute('scope')).toBe('col');
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Supplier Navigation Accessibility', async ({ page }) => {
    await page.goto('/supplier/dashboard');
    
    // Test navigation accessibility
    const nav = await page.locator('nav');
    expect(await nav.getAttribute('role')).toBe('navigation');
    expect(await nav.getAttribute('aria-label')).toBeTruthy();

    const links = await page.locator('nav a');
    for (const link of await links.all()) {
      expect(await link.getAttribute('aria-current')).toBeTruthy();
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
}); 