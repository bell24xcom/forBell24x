import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../../test-data/factory';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { RFQPage } from '../../pages/rfq.page';
import { APIHelpers } from '../../api-helpers';

test.describe('RFQ AI Features', () => {
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

  test('should display AI recommendations for RFQ', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Create RFQ with AI-relevant fields
    await rfqPage.clickCreateRFQ();
    await rfqPage.fillRFQForm({
      title: 'Test RFQ with AI',
      description: 'Test RFQ for AI recommendations',
      quantity: 100,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      region: 'Asia',
      urgency: 'normal',
      value: 15000
    });
    await rfqPage.submitRFQ();

    // Wait for AI recommendations to load
    await expect(page.getByTestId('ai-recommendations')).toBeVisible();
    
    // Verify supplier recommendations are displayed
    const recommendations = page.getByTestId('supplier-recommendation');
    await expect(recommendations).toHaveCount(5);
    
    // Verify each recommendation has required fields
    for (let i = 0; i < 5; i++) {
      const recommendation = recommendations.nth(i);
      await expect(recommendation.getByTestId('supplier-name')).toBeVisible();
      await expect(recommendation.getByTestId('supplier-category')).toBeVisible();
      await expect(recommendation.getByTestId('supplier-region')).toBeVisible();
    }
  });

  test('should display acceptance prediction for RFQ', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Create high-value RFQ
    await rfqPage.clickCreateRFQ();
    await rfqPage.fillRFQForm({
      title: 'High-Value RFQ',
      description: 'Test RFQ for acceptance prediction',
      quantity: 1000,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      region: 'Asia',
      urgency: 'normal',
      value: 100000
    });
    await rfqPage.submitRFQ();

    // Wait for acceptance prediction to load
    await expect(page.getByTestId('acceptance-prediction')).toBeVisible();
    
    // Verify prediction is displayed with correct format
    const prediction = page.getByTestId('prediction-value');
    await expect(prediction).toBeVisible();
    await expect(prediction).toHaveText(/\d+%/);
    
    // Verify prediction is high for high-value RFQ
    const predictionValue = await prediction.textContent();
    const probability = parseInt(predictionValue!.replace('%', ''));
    expect(probability).toBeGreaterThan(70);
  });

  test('should handle high-urgency RFQ predictions', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Create high-urgency RFQ
    await rfqPage.clickCreateRFQ();
    await rfqPage.fillRFQForm({
      title: 'High-Urgency RFQ',
      description: 'Test RFQ for urgency impact',
      quantity: 100,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      region: 'Asia',
      urgency: 'high',
      value: 5000
    });
    await rfqPage.submitRFQ();

    // Wait for acceptance prediction to load
    await expect(page.getByTestId('acceptance-prediction')).toBeVisible();
    
    // Verify prediction is displayed
    const prediction = page.getByTestId('prediction-value');
    await expect(prediction).toBeVisible();
    
    // Verify prediction is lower for high-urgency RFQ
    const predictionValue = await prediction.textContent();
    const probability = parseInt(predictionValue!.replace('%', ''));
    expect(probability).toBeLessThan(70);
  });

  test('should handle no matching suppliers gracefully', async ({ page }) => {
    // Navigate to RFQ page
    await dashboardPage.navigateToRFQ();
    await rfqPage.waitForLoad();

    // Create RFQ with non-existent category
    await rfqPage.clickCreateRFQ();
    await rfqPage.fillRFQForm({
      title: 'No-Match RFQ',
      description: 'Test RFQ with no matching suppliers',
      quantity: 100,
      unit: 'units',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'NonExistentCategory',
      region: 'NonExistentRegion',
      urgency: 'normal',
      value: 10000
    });
    await rfqPage.submitRFQ();

    // Verify no recommendations message
    await expect(page.getByText('No matching suppliers found')).toBeVisible();
    await expect(page.getByTestId('ai-recommendations')).not.toBeVisible();
  });

  test.afterEach(async () => {
    // Cleanup test data
    await api.cleanupTestData();
  });
}); 