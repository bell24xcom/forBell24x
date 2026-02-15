import { test as base, type Page, type APIRequestContext } from '@playwright/test';
import { createApiHelper } from './api.helper';
import { createAssertions } from './assertions';
import { TestDataFactory, createRFQ } from './test-data.factory';
import { loginAsAdmin, login, type UserCredentials } from '../test-utils';

/**
 * Extend the base test with our custom fixtures
 */
export const test = base.extend<{
  // Core fixtures
  page: Page;
  api: ReturnType<typeof createApiHelper>;
  assertions: ReturnType<typeof createAssertions>;
  
  // Authentication
  login: (credentials?: UserCredentials) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  
  // Test data
  createRFQ: typeof createRFQ;
  factory: typeof TestDataFactory;
  
  // API clients
  request: APIRequestContext;
  
  // Helpers
  takeScreenshot: (name: string) => Promise<void>;
}>({
  // Default page with authentication
  page: async ({ page, request }, use) => {
    // Setup API helper
    const api = createApiHelper(page, request);
    
    // Add authentication if needed
    const token = await api.login();
    await api.setupAuth(token);
    
    // Use the page
    await use(page);
    
    // Cleanup if needed
  },
  
  // API helper
  api: async ({ page, request }, use) => {
    const api = createApiHelper(page, request);
    await use(api);
  },
  
  // Assertions helper
  assertions: async ({ page }, use) => {
    const assertions = createAssertions(page);
    await use(assertions);
  },
  
  // Authentication helpers
  login: async ({ page }, use) => {
    await use(async (credentials) => {
      await login(page, credentials);
    });
  },
  
  loginAsAdmin: async ({ page }, use) => {
    await use(async () => {
      await loginAsAdmin(page);
    });
  },
  
  // Test data helpers
  createRFQ: async ({}, use) => {
    await use(createRFQ);
  },
  
  factory: async ({}, use) => {
    await use(TestDataFactory);
  },
  
  // API request context
  request: async ({ request }, use) => {
    await use(request);
  },
  
  // Screenshot helper
  takeScreenshot: async ({ page }, use) => {
    await use(async (name: string) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `test-results/screenshots/${name}-${timestamp}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
    });
  },
});

// Re-export everything for convenience
export { expect } from '@playwright/test';
export * from './assertions';
export * from './api.helper';
export * from './test-data.factory';
