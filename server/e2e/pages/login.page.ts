import { Page } from '@playwright/test';

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: /login/i }).click();
  }

  async waitForLoad() {
    await this.page.getByRole('heading', { name: /dashboard/i }).waitFor();
  }
}
