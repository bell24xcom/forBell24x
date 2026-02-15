import { Page } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async mockAuth() {
    // Mock authentication for protected routes
    await this.page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 1, email: 'test@example.com' } }),
      });
    });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Additional buffer
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async measurePerformance(url: string) {
    const startTime = Date.now();
    await this.page.goto(url);
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementToBeVisible(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async waitForElementToBeHidden(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  async clickAndWait(selector: string) {
    await this.page.click(selector);
    await this.page.waitForTimeout(500);
  }

  async fillAndWait(selector: string, value: string) {
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(200);
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
    await this.page.waitForTimeout(200);
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForResponse(url: string) {
    await this.page.waitForResponse(response => response.url().includes(url));
  }

  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  async mockApiError(url: string, status = 500) {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Mock error' }),
      });
    });
  }

  async getElementText(selector: string) {
    return await this.page.locator(selector).textContent();
  }

  async getElementAttribute(selector: string, attribute: string) {
    return await this.page.locator(selector).getAttribute(attribute);
  }

  async isElementVisible(selector: string) {
    return await this.page.locator(selector).isVisible();
  }

  async isElementEnabled(selector: string) {
    return await this.page.locator(selector).isEnabled();
  }

  async countElements(selector: string) {
    return await this.page.locator(selector).count();
  }

  async waitForAnimation(selector: string) {
    await this.page.waitForFunction(sel => {
      const element = document.querySelector(sel);
      if (!element) return false;

      const style = window.getComputedStyle(element);
      return style.animation === 'none' || style.transition === 'none';
    }, selector);
  }

  async waitForCounterAnimation(selector: string, targetValue: number) {
    await this.page.waitForFunction(
      (sel, target) => {
        const element = document.querySelector(sel);
        if (!element) return false;

        const text = element.textContent;
        const numbers = text?.match(/\d+/g);
        if (!numbers) return false;

        return numbers.some(num => parseInt(num) >= target);
      },
      selector,
      targetValue
    );
  }

  async waitForUrlChange(expectedUrl: string) {
    await this.page.waitForURL(expectedUrl);
  }

  async waitForUrlToContain(partialUrl: string) {
    await this.page.waitForURL(url => url.includes(partialUrl));
  }

  async waitForModalToOpen() {
    await this.page.waitForSelector('[data-testid="modal"]', {
      state: 'visible',
    });
  }

  async waitForModalToClose() {
    await this.page.waitForSelector('[data-testid="modal"]', {
      state: 'hidden',
    });
  }

  async waitForToast(message: string) {
    await this.page.waitForSelector(`text=${message}`, { state: 'visible' });
  }

  async waitForLoadingToComplete() {
    await this.page.waitForSelector('[data-testid="loading"]', {
      state: 'hidden',
    });
  }

  async waitForErrorToAppear() {
    await this.page.waitForSelector('[data-testid="error"]', {
      state: 'visible',
    });
  }

  async simulateSlowNetwork() {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  async simulateOffline() {
    await this.page.route('**/*', route => {
      route.abort();
    });
  }

  async restoreNetwork() {
    await this.page.route('**/*', route => {
      route.continue();
    });
  }

  async getPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
  }

  async getMemoryUsage() {
    return await this.page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });
  }

  async getNetworkRequests() {
    return await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        initiatorType: entry.initiatorType,
      }));
    });
  }
}

// Global test utilities
export const testUtils = {
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  generateTestData() {
    return {
      user: {
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User',
        company: 'Test Company',
      },
      supplier: {
        name: 'Test Supplier',
        category: 'Electronics',
        location: 'Mumbai, Maharashtra',
        description: 'Test supplier description',
      },
      rfq: {
        title: 'Test RFQ',
        description: 'Test RFQ description',
        category: 'Electronics',
        quantity: 100,
        budget: 50000,
      },
    };
  },

  async createTestUser(page: Page) {
    const testData = this.generateTestData();

    await page.goto('/auth/register');
    await page.fill('input[name="email"]', testData.user.email);
    await page.fill('input[name="password"]', testData.user.password);
    await page.fill('input[name="name"]', testData.user.name);
    await page.fill('input[name="company"]', testData.user.company);
    await page.click('button[type="submit"]');

    return testData.user;
  },

  async loginTestUser(page: Page, email: string, password: string) {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  },
};
