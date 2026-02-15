import { Page } from '@playwright/test';

export class RFQPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad() {
    await this.page.getByRole('heading', { name: /rfqs/i }).waitFor();
  }

  async clickCreateRFQ() {
    await this.page.getByRole('button', { name: /create rfq/i }).click();
    await this.page.getByRole('heading', { name: /create rfq/i }).waitFor();
  }

  async fillRFQForm(data: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    deliveryDate: string;
    category?: string;
    region?: string;
    urgency?: 'normal' | 'high';
    value?: number;
  }) {
    await this.page.getByLabel('Title').fill(data.title);
    await this.page.getByLabel('Description').fill(data.description);
    await this.page.getByLabel('Quantity').fill(data.quantity.toString());
    await this.page.getByLabel('Unit').selectOption(data.unit);
    await this.page.getByLabel('Delivery Date').fill(data.deliveryDate);

    // Fill AI-related fields if provided
    if (data.category) {
      await this.page.getByLabel('Category').selectOption(data.category);
    }
    if (data.region) {
      await this.page.getByLabel('Region').selectOption(data.region);
    }
    if (data.urgency) {
      await this.page.getByLabel('Urgency').selectOption(data.urgency);
    }
    if (data.value) {
      await this.page.getByLabel('Value').fill(data.value.toString());
    }
  }

  async submitRFQ() {
    await this.page.getByRole('button', { name: /submit/i }).click();
    await this.page.getByText('RFQ created successfully').waitFor();
  }

  async waitForAIRecommendations() {
    await this.page.getByTestId('ai-recommendations').waitFor();
  }

  async waitForAcceptancePrediction() {
    await this.page.getByTestId('acceptance-prediction').waitFor();
  }

  async getRecommendationCount() {
    return await this.page.getByTestId('supplier-recommendation').count();
  }

  async getPredictionValue() {
    const prediction = await this.page.getByTestId('prediction-value').textContent();
    return prediction ? parseInt(prediction.replace('%', '')) : null;
  }
}
