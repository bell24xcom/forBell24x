import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { AnalyticsPage } from '../../pages/analytics.page';
import { APIHelpers } from '../../api-helpers';
import { createTestRFQ, createTestSupplier, createTestTransaction } from '../../test-utils';

test.describe('Analytics and Reporting', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let analyticsPage: AnalyticsPage;
  let api: APIHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    analyticsPage = new AnalyticsPage(page);
    api = new APIHelpers();

    // Create test user
    const { user } = TestDataFactory.createScenario();
    await api.createUser(user);

    // Login
    await loginPage.login(user.email, user.password);
    await dashboardPage.waitForLoad();
  });

  test('should generate dynamic reports', async ({ page }) => {
    // Create test data
    const suppliers = [
      {
        name: 'Supplier A',
        specialties: ['electronics']
      },
      {
        name: 'Supplier B',
        specialties: ['software']
      }
    ];

    // Create suppliers
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

    // Create RFQs
    const rfqs = [
      {
        title: 'RFQ 1',
        quantity: 100,
        unit: 'units',
        category: 'electronics'
      },
      {
        title: 'RFQ 2',
        quantity: 200,
        unit: 'units',
        category: 'software'
      }
    ];

    for (const rfq of rfqs) {
      await createTestRFQ(page, rfq);
    }

    // Create transactions
    const transactions = [
      {
        type: 'rfq_submission',
        status: 'completed',
        amount: 10000,
        date: new Date(Date.now()).toISOString()
      },
      {
        type: 'supplier_match',
        status: 'completed',
        amount: 5000,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const transaction of transactions) {
      await createTestTransaction(page, transaction);
    }

    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Generate report
    await analyticsPage.selectReportType('supplier_performance');
    await analyticsPage.selectDateRange('last_30_days');
    await analyticsPage.generateReport();

    // Verify report generation
    await expect(page.getByText('Report generated successfully')).toBeVisible();

    // Verify report data
    await analyticsPage.verifyChartVisibility();
    await analyticsPage.verifyMetricsSection();

    // Verify specific metrics
    const supplierCount = await page.getByText('Total Suppliers: 2');
    await expect(supplierCount).toBeVisible();

    const transactionVolume = await page.getByText('Transaction Volume: ₹15,000');
    await expect(transactionVolume).toBeVisible();
  });

  test('should customize report templates', async ({ page }) => {
    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Create custom template
    await analyticsPage.clickCreateTemplate();
    await analyticsPage.fillTemplateForm({
      name: 'Custom Supplier Report',
      description: 'Customized supplier performance report',
      metrics: ['supplier_count', 'transaction_volume', 'match_rate']
    });
    await analyticsPage.saveTemplate();

    // Verify template creation
    await expect(page.getByText('Template created successfully')).toBeVisible();
    const template = await page.getByText('Custom Supplier Report');
    await expect(template).toBeVisible();

    // Use custom template
    await analyticsPage.selectTemplate('Custom Supplier Report');
    await analyticsPage.generateReport();

    // Verify custom metrics
    const customMetrics = await page.getByRole('heading', { name: /custom metrics/i });
    await expect(customMetrics).toBeVisible();

    // Verify specific metrics
    const matchRate = await page.getByText('Match Rate: 100%');
    await expect(matchRate).toBeVisible();
  });

  test('should schedule reports', async ({ page }) => {
    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Schedule report
    await analyticsPage.clickScheduleReport();
    await analyticsPage.fillScheduleForm({
      name: 'Weekly Supplier Report',
      frequency: 'weekly',
      day: 'monday',
      time: '09:00',
      recipients: ['admin@example.com']
    });
    await analyticsPage.saveSchedule();

    // Verify schedule creation
    await expect(page.getByText('Schedule created successfully')).toBeVisible();
    const schedule = await page.getByText('Weekly Supplier Report');
    await expect(schedule).toBeVisible();

    // Verify schedule details
    const frequency = await page.getByText('Weekly');
    await expect(frequency).toBeVisible();

    const time = await page.getByText('09:00');
    await expect(time).toBeVisible();
  });

  test('should handle report exports', async ({ page }) => {
    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Generate report
    await analyticsPage.selectReportType('supplier_performance');
    await analyticsPage.generateReport();

    // Export to PDF
    await analyticsPage.clickExportPDF();
    await expect(page.getByText('PDF export successful')).toBeVisible();

    // Export to Excel
    await analyticsPage.clickExportExcel();
    await expect(page.getByText('Excel export successful')).toBeVisible();

    // Export to CSV
    await analyticsPage.clickExportCSV();
    await expect(page.getByText('CSV export successful')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // Navigate to analytics page with no data
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Verify empty state
    const emptyMessage = await page.getByText('No data available');
    await expect(emptyMessage).toBeVisible();

    // Verify filter options are still available
    const dateFilter = await page.getByLabel('Date Range');
    await expect(dateFilter).toBeVisible();

    const reportType = await page.getByLabel('Report Type');
    await expect(reportType).toBeVisible();
  });

  test('should handle report errors', async ({ page }) => {
    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Try generating report with invalid date range
    await analyticsPage.selectReportType('supplier_performance');
    await analyticsPage.selectDateRange('invalid_date');
    await analyticsPage.generateReport();

    // Verify error message
    const errorMessage = await page.getByText('Invalid date range selected');
    await expect(errorMessage).toBeVisible();

    // Try generating report with invalid template
    await analyticsPage.selectTemplate('non_existent_template');
    await analyticsPage.generateReport();

    const templateError = await page.getByText('Template not found');
    await expect(templateError).toBeVisible();
  });

  test('should handle performance metrics', async ({ page }) => {
    // Create large dataset
    const suppliers = Array.from({ length: 100 }, (_, i) => ({
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

    // Navigate to analytics page
    await page.getByRole('link', { name: /analytics/i }).click();
    await analyticsPage.waitForLoad();

    // Generate performance report
    await analyticsPage.selectReportType('supplier_performance');
    await analyticsPage.generateReport();

    // Verify performance metrics
    const loadTime = await page.getByText('Load Time: < 2s');
    await expect(loadTime).toBeVisible();

    const responseTime = await page.getByText('Response Time: < 1s');
    await expect(responseTime).toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
});
