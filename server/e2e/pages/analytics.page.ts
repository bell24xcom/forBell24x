import { Page } from '@playwright/test';

export class AnalyticsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad() {
    await this.page.getByRole('heading', { name: /analytics dashboard/i }).waitFor();
  }

  async selectReportType(type: string) {
    await this.page.getByLabel('Report Type').selectOption(type);
  }

  async selectDateRange(range: string) {
    await this.page.getByLabel('Date Range').selectOption(range);
  }

  async generateReport() {
    await this.page.getByRole('button', { name: /generate report/i }).click();
    await this.page.getByText('Report generated successfully').waitFor();
  }

  async clickCreateTemplate() {
    await this.page.getByRole('button', { name: /create template/i }).click();
    await this.page.getByRole('heading', { name: /create report template/i }).waitFor();
  }

  async fillTemplateForm(data: {
    name: string;
    description: string;
    metrics: string[];
  }) {
    await this.page.getByLabel('Template Name').fill(data.name);
    await this.page.getByLabel('Description').fill(data.description);

    // Select metrics
    for (const metric of data.metrics) {
      await this.page.getByLabel(metric).check();
    }
  }

  async saveTemplate() {
    await this.page.getByRole('button', { name: /save template/i }).click();
    await this.page.getByText('Template created successfully').waitFor();
  }

  async selectTemplate(name: string) {
    await this.page.getByRole('combobox', { name: /template/i }).selectOption(name);
  }

  async clickScheduleReport() {
    await this.page.getByRole('button', { name: /schedule report/i }).click();
    await this.page.getByRole('heading', { name: /schedule report/i }).waitFor();
  }

  async fillScheduleForm(data: {
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: string;
    time: string;
    recipients: string[];
  }) {
    await this.page.getByLabel('Schedule Name').fill(data.name);
    await this.page.getByLabel('Frequency').selectOption(data.frequency);

    if (data.day) {
      await this.page.getByLabel('Day').selectOption(data.day);
    }

    await this.page.getByLabel('Time').fill(data.time);

    // Add recipients
    for (const recipient of data.recipients) {
      await this.page.getByLabel('Recipients').fill(recipient);
      await this.page.keyboard.press('Enter');
    }
  }

  async saveSchedule() {
    await this.page.getByRole('button', { name: /save schedule/i }).click();
    await this.page.getByText('Schedule created successfully').waitFor();
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

  async verifyChartVisibility() {
    const chart = await this.page.getByRole('img', { name: /performance chart/i });
    await expect(chart).toBeVisible();
  }

  async verifyMetricsSection() {
    const metrics = await this.page.getByRole('heading', { name: /metrics/i });
    await expect(metrics).toBeVisible();
  }
}
