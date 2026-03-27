import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Bell24h tests...');
  
  // You can add global setup logic here, such as:
  // - Setting up test data
  // - Authenticating once for all tests
  // - Checking if the site is accessible
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if the site is accessible
    const baseUrl = process.env.BASE_URL || 'https://www.bell24h.com';
    console.log(`🔍 Checking site accessibility: ${baseUrl}`);
    
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Site is accessible and ready for testing');
    
  } catch (error) {
    console.error('❌ Site accessibility check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;
