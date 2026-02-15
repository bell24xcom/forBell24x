import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './server/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30 * 1000,
  use: {
    baseURL: 'http://localhost:3001',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    headless: false
  }
});
