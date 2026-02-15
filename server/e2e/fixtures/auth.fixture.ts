import { test as base, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { createApiHelpers } from '../api-helpers';
import { UserCredentials } from '../test-utils';

type AuthFixtures = {
  // API clients
  api: ReturnType<typeof createApiHelpers>;
  request: APIRequestContext;
  
  // Pages
  page: Page;
  adminPage: Page;
  userPage: Page;
  
  // Contexts
  adminContext: BrowserContext;
  userContext: BrowserContext;
  
  // Credentials
  adminCredentials: UserCredentials;
  userCredentials: UserCredentials;
};

export const test = base.extend<AuthFixtures>({
  // Default API request context
  request: async ({ browser }, use) => {
    const context = await browser.newContext();
    const request = context.request;
    await use(request);
    await context.close();
  },
  
  // API helpers
  api: async ({ request }, use) => {
    const api = createApiHelpers(request);
    await use(api);
  },
  
  // Admin context and page
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 },
      },
    });
    
    await use(context);
    await context.close();
  },
  
  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    await page.close();
  },
  
  // Regular user context and page
  userContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 },
      },
    });
    
    await use(context);
    await context.close();
  },
  
  userPage: async ({ userContext }, use) => {
    const page = await userContext.newPage();
    await use(page);
    await page.close();
  },
  
  // Test credentials
  adminCredentials: {
    email: process.env.PLAYWRIGHT_TEST_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.PLAYWRIGHT_TEST_ADMIN_PASSWORD || 'admin1234',
  },
  
  userCredentials: {
    email: process.env.PLAYWRIGHT_TEST_USER_EMAIL || 'user@example.com',
    password: process.env.PLAYWRIGHT_TEST_USER_PASSWORD || 'user1234',
  },
});

export { expect } from '@playwright/test';
