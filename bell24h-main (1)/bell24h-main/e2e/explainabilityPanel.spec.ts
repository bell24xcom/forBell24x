import { test, expect, Page } from '@playwright/test';

// Test IDs for different RFQ scenarios
const RFQ_ID_WITH_DATA = 'rfq-explain-data-001';
const RFQ_ID_NO_DATA = 'rfq-explain-nodata-002';
const RFQ_ID_API_ERROR = 'rfq-explain-error-003';

// Mock data for explainability
const mockExplanationData = {
  rfqId: RFQ_ID_WITH_DATA,
  modelType: 'SHAP',
  timestamp: new Date().toISOString(),
  features: [
    { name: 'Credit Score', value: 720, importance: 0.32 },
    { name: 'Loan Amount', value: 250000, importance: -0.21 },
    { name: 'Income to Debt Ratio', value: 0.28, importance: 0.18 },
    { name: 'Employment Years', value: 5, importance: 0.15 },
    { name: 'Previous Default History', value: 'None', importance: 0.12 }
  ]
};

const mockEmptyExplanationData = {
  rfqId: RFQ_ID_NO_DATA,
  modelType: 'LIME',
  timestamp: new Date().toISOString(),
  features: []
};

// Helper to set up API mocks
async function setupApiMocks(page: Page) {
  // Mock explainability data API endpoints
  await page.route(`**/api/rfq/${RFQ_ID_WITH_DATA}/explainability`, route => 
    route.fulfill({ 
      status: 200, 
      json: mockExplanationData 
    })
  );
  
  await page.route(`**/api/rfq/${RFQ_ID_NO_DATA}/explainability`, route => 
    route.fulfill({ 
      status: 200, 
      json: mockEmptyExplanationData 
    })
  );
  
  await page.route(`**/api/rfq/${RFQ_ID_API_ERROR}/explainability`, route => 
    route.fulfill({ 
      status: 500, 
      json: { error: 'Internal Server Error' } 
    })
  );

  // Mock feedback API - default to success response
  await page.route('**/api/feedback', route => {
    const requestData = route.request().postDataJSON();
    console.log('Feedback API called with:', requestData);
    
    return route.fulfill({ 
      status: 200, 
      json: { success: true, message: 'Feedback received' } 
    });
  });
}

test.describe('AI Explainability Panel Features', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('should display explainability data correctly', async ({ page }) => {
    // Navigate to RFQ details page with valid explainability data
    await page.goto(`/rfq/${RFQ_ID_WITH_DATA}`);
    
    // Wait for loading to complete
    await expect(page.getByTestId('explainability-loading')).toBeVisible();
    await expect(page.getByTestId('explainability-loading')).not.toBeVisible({ timeout: 5000 });
    
    // Verify panel title and model type are displayed
    await expect(page.getByText(`AI Model Explanation (${mockExplanationData.modelType})`)).toBeVisible();
    
    // Verify feature importance chart is displayed
    const chart = page.getByTestId('feature-importance-chart');
    await expect(chart).toBeVisible();
    
    // Verify at least one feature bar is visible in the chart
    await expect(page.getByTestId('feature-bar')).toBeVisible();
    
    // Verify feature names are displayed
    for (const feature of mockExplanationData.features) {
      await expect(page.getByText(feature.name, { exact: false })).toBeVisible();
    }
    
    // Verify feedback panel is present
    await expect(page.getByText('Feedback on this Explanation')).toBeVisible();
    await expect(page.getByLabel('How satisfied are you with this explanation?')).toBeVisible();
  });

  test('should display error message when explainability API fails', async ({ page }) => {
    await page.goto(`/rfq/${RFQ_ID_API_ERROR}`);
    
    // Wait for loading to finish
    await expect(page.getByTestId('explainability-loading')).toBeVisible();
    await expect(page.getByTestId('explainability-loading')).not.toBeVisible({ timeout: 5000 });
    
    // Verify error message is displayed
    await expect(page.getByText(/Error loading explainability data/)).toBeVisible();
    
    // Verify chart is not displayed
    await expect(page.getByTestId('feature-importance-chart')).not.toBeVisible();
  });
  
  test('should display no data message when no features are available', async ({ page }) => {
    await page.goto(`/rfq/${RFQ_ID_NO_DATA}`);
    
    // Wait for loading to finish
    await expect(page.getByTestId('explainability-loading')).toBeVisible();
    await expect(page.getByTestId('explainability-loading')).not.toBeVisible({ timeout: 5000 });
    
    // Verify no data message is displayed
    await expect(page.getByText('No explainability data available for this RFQ.')).toBeVisible();
    
    // Verify chart is not displayed
    await expect(page.getByTestId('feature-importance-chart')).not.toBeVisible();
  });

  test('should submit feedback successfully', async ({ page }) => {
    await page.goto(`/rfq/${RFQ_ID_WITH_DATA}`);
    
    // Wait for explainability data to load
    await expect(page.getByTestId('explainability-loading')).not.toBeVisible({ timeout: 5000 });
    
    // Select a star rating (4 stars)
    // Note: This selector might need adjustment based on actual DOM structure
    await page.locator('[name="satisfaction-rating"][value="4"]').click();
    
    // Enter comments
    await page.getByLabel('Additional Comments (Optional)').fill('This explanation was helpful and clear.');
    
    // Click submit button
    await page.getByRole('button', { name: 'Submit Feedback' }).click();
    
    // Verify loading state appears
    await expect(page.getByRole('progressbar')).toBeVisible();
    
    // Verify success message appears
    await expect(page.getByText('Thank you for your feedback!')).toBeVisible({ timeout: 5000 });
    
    // Verify form resets (rating cleared and comments field empty)
    await expect(page.getByLabel('Additional Comments (Optional)')).toHaveValue('');
  });
  
  test('should handle feedback submission error', async ({ page }) => {
    // Override the default feedback API mock to return an error
    await page.route('**/api/feedback', route => 
      route.fulfill({ 
        status: 500, 
        json: { error: 'Server error while saving feedback' } 
      })
    );
    
    await page.goto(`/rfq/${RFQ_ID_WITH_DATA}`);
    
    // Wait for explainability data to load
    await expect(page.getByTestId('explainability-loading')).not.toBeVisible({ timeout: 5000 });
    
    // Select a star rating (3 stars)
    await page.locator('[name="satisfaction-rating"][value="3"]').click();
    
    // Enter comments
    await page.getByLabel('Additional Comments (Optional)').fill('Test feedback with error response.');
    
    // Click submit button
    await page.getByRole('button', { name: 'Submit Feedback' }).click();
    
    // Verify loading state appears
    await expect(page.getByRole('progressbar')).toBeVisible();
    
    // Verify error message appears
    await expect(page.getByText(/API error: 500/)).toBeVisible({ timeout: 5000 });
    
    // Verify form values are preserved
    await expect(page.getByLabel('Additional Comments (Optional)')).toHaveValue('Test feedback with error response.');
  });
  
  test('should require satisfaction rating before submitting feedback', async ({ page }) => {
    await page.goto(`/rfq/${RFQ_ID_WITH_DATA}`);
    
    // Wait for explainability data to load
    await expect(page.getByTestId('explainability-loading')).not.toBeVisible({ timeout: 5000 });
    
    // Verify submit button is disabled initially
    await expect(page.getByRole('button', { name: 'Submit Feedback' })).toBeDisabled();
    
    // Enter comments without rating
    await page.getByLabel('Additional Comments (Optional)').fill('Comments without rating.');
    
    // Verify button is still disabled
    await expect(page.getByRole('button', { name: 'Submit Feedback' })).toBeDisabled();
    
    // Select a rating
    await page.locator('[name="satisfaction-rating"][value="5"]').click();
    
    // Verify button is now enabled
    await expect(page.getByRole('button', { name: 'Submit Feedback' })).toBeEnabled();
  });
});
