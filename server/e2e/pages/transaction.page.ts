import { Page, expect } from '@playwright/test';

export class TransactionPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad() {
    await this.page.getByRole('heading', { name: /transaction history/i }).waitFor();
  }

  async clickExportPDF() {
    await this.page.getByRole('button', { name: /export pdf/i }).click();
    await this.page.getByText('PDF export successful').waitFor();
  }

  async clickExportExcel() {
    await this.page.getByRole('button', { name: /export excel/i }).click();
    await this.page.getByText('Excel export successful').waitFor();
  }

  async clickExportCSV() {
    await this.page.getByRole('button', { name: /export csv/i }).click();
    await this.page.getByText('CSV export successful').waitFor();
  }

  async setTransactionTypeFilter(type: string) {
    await this.page.getByLabel('Transaction Type').selectOption(type);
  }

  async setDateRangeFilter(startDate: string, endDate: string) {
    await this.page.getByLabel('Start Date').fill(startDate);
    await this.page.getByLabel('End Date').fill(endDate);
  }

  async clearFilters() {
    await this.page.getByRole('button', { name: /clear filters/i }).click();
  }

  async getTransactionCount() {
    const rows = await this.page.getByRole('row');
    return rows.count();
  }

  async verifyTransactionDetails(index: number, details: {
    type: string;
    status: string;
    amount: string;
    date: string;
  }) {
    const row = await this.page.getByRole('row').nth(index);
    
    await expect(row.getByText(details.type)).toBeVisible();
    await expect(row.getByText(details.status)).toBeVisible();
    await expect(row.getByText(details.amount)).toBeVisible();
    await expect(row.getByText(details.date)).toBeVisible();
  }

  async verifyEmptyState() {
    const emptyMessage = await this.page.getByText('No transactions found');
    await expect(emptyMessage).toBeVisible();
  }
}
