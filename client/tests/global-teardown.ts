import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for Bell24h tests...');
  
  // You can add global cleanup logic here, such as:
  // - Cleaning up test data
  // - Logging test results
  // - Sending notifications
  
  console.log('✅ Global teardown completed successfully');
}

export default globalTeardown;
