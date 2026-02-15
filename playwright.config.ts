import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  expect: { timeout: 10_000 },
  testDir: 'tests/e2e',
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL:
      process.env.E2E_BASE_URL ||
      'http://localhost:3000', // fallback; set E2E_BASE_URL to Railway for prod checks
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});