import { Page } from '@playwright/test';

export class DashboardPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad() {
    await this.page.getByRole('heading', { name: /dashboard/i }).waitFor();
  }

  async navigateToRFQ() {
    await this.page.getByRole('link', { name: /rfqs/i }).click();
    await this.page.getByRole('heading', { name: /rfqs/i }).waitFor();
  }
}
