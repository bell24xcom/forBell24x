import { FullConfig, chromium } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  // Perform authentication
  try {
    console.log('Performing global setup...');
    
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.getByLabel('Email').fill(process.env.PLAYWRIGHT_TEST_ADMIN_EMAIL || 'admin@example.com');
    await page.getByLabel('Password').fill(process.env.PLAYWRIGHT_TEST_ADMIN_PASSWORD || 'admin1234');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard');
    
    // Save signed-in state to 'storageState.json'
    await page.context().storageState({ path: storageState as string });
    console.log('Authentication completed and state saved.');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
