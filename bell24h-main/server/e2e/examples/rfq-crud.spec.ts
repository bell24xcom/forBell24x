import { test, expect } from '../fixtures/test.fixture';
import { createRFQ } from '../fixtures/test-data.factory';

test.describe('RFQ Management', () => {
  test('should create a new RFQ', async ({ page, api, assertions }) => {
    // Navigate to the RFQ creation page
    await page.goto('/rfqs/new');
    
    // Create test data
    const rfqData = createRFQ({
      productName: 'Test Product',
      description: 'This is a test RFQ',
      quantity: 10,
      targetPrice: 100,
      unit: 'pcs',
    });

    // Fill out the form
    await page.getByLabel('Title').fill(rfqData.productName);
    await page.getByLabel('Description').fill(rfqData.description);
    await page.getByLabel('Quantity').fill(rfqData.quantity.toString());
    await page.getByLabel('Target Price').fill(rfqData.targetPrice.toString());
    await page.getByLabel('Unit').selectOption(rfqData.unit);
    
    // Submit the form
    await page.getByRole('button', { name: /create rfq/i }).click();
    
    // Verify successful creation
    await assertions.toBeOnPath('/rfqs/');
    await assertions.toSeeSuccessMessage(/rfq created successfully/i);
    
    // Verify RFQ is displayed in the list
    await expect(page.getByText(rfqData.productName)).toBeVisible();
    await expect(page.getByText(rfqData.description)).toBeVisible();
  });

  test('should view RFQ details', async ({ page, api }) => {
    // Create an RFQ via API
    const rfqData = createRFQ();
    const { id } = await api.createTestRFQ(rfqData);
    
    // Navigate to the RFQ details page
    await page.goto(`/rfqs/${id}`);
    
    // Verify RFQ details are displayed
    await expect(page.getByText(rfqData.productName)).toBeVisible();
    await expect(page.getByText(rfqData.description)).toBeVisible();
    await expect(page.getByText(rfqData.quantity.toString())).toBeVisible();
    await expect(page.getByText(rfqData.targetPrice.toString())).toBeVisible();
  });

  test('should update an RFQ', async ({ page, api, assertions }) => {
    // Create an RFQ via API
    const rfqData = createRFQ();
    const { id } = await api.createTestRFQ(rfqData);
    
    // Navigate to the edit page
    await page.goto(`/rfqs/${id}/edit`);
    
    // Update the RFQ
    const updatedData = {
      productName: 'Updated Product Name',
      description: 'Updated description',
      quantity: 20,
      targetPrice: 200,
    };
    
    await page.getByLabel('Title').fill(updatedData.productName);
    await page.getByLabel('Description').fill(updatedData.description);
    await page.getByLabel('Quantity').fill(updatedData.quantity.toString());
    await page.getByLabel('Target Price').fill(updatedData.targetPrice.toString());
    
    // Submit the form
    await page.getByRole('button', { name: /update rfq/i }).click();
    
    // Verify successful update
    await assertions.toBeOnPath(`/rfqs/${id}`);
    await assertions.toSeeSuccessMessage(/rfq updated successfully/i);
    
    // Verify updated details
    await expect(page.getByText(updatedData.productName)).toBeVisible();
    await expect(page.getByText(updatedData.description)).toBeVisible();
    await expect(page.getByText(updatedData.quantity.toString())).toBeVisible();
    await expect(page.getByText(updatedData.targetPrice.toString())).toBeVisible();
  });

  test('should delete an RFQ', async ({ page, api, assertions }) => {
    // Create an RFQ via API
    const rfqData = createRFQ();
    const { id } = await api.createTestRFQ(rfqData);
    
    // Navigate to the RFQ details page
    await page.goto(`/rfqs/${id}`);
    
    // Delete the RFQ
    await page.getByRole('button', { name: /delete rfq/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /yes, delete/i }).click();
    
    // Verify successful deletion
    await assertions.toBeOnPath('/rfqs');
    await assertions.toSeeSuccessMessage(/rfq deleted successfully/i);
    
    // Verify RFQ is no longer in the list
    await expect(page.getByText(rfqData.productName)).not.toBeVisible();
  });

  test('should display validation errors', async ({ page, assertions }) => {
    // Navigate to the RFQ creation page
    await page.goto('/rfqs/new');
    
    // Try to submit the form without filling any fields
    await page.getByRole('button', { name: /create rfq/i }).click();
    
    // Verify validation errors
    await assertions.toSeeFieldError('Title');
    await assertions.toSeeFieldError('Description');
    await assertions.toSeeFieldError('Quantity');
    await assertions.toSeeFieldError('Target Price');
  });

  test('should paginate RFQ list', async ({ page, api }) => {
    // Create multiple RFQs via API
    const rfqs = [];
    for (let i = 0; i < 25; i++) {
      const rfq = await api.createTestRFQ({
        productName: `RFQ ${i + 1}`,
        description: `Description for RFQ ${i + 1}`,
        quantity: i + 1,
        targetPrice: (i + 1) * 10,
      });
      rfqs.push(rfq);
    }
    
    // Navigate to the RFQ list
    await page.goto('/rfqs');
    
    // Verify pagination controls
    const pagination = page.locator('.pagination');
    await expect(pagination).toBeVisible();
    
    // Go to next page
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('RFQ 21')).toBeVisible();
    
    // Go to previous page
    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText('RFQ 1')).toBeVisible();
  });
});
