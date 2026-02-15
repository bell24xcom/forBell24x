import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Test configuration
export const config = {
  // Application
  app: {
    baseUrl: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001',
    apiBaseUrl: process.env.PLAYWRIGHT_TEST_API_BASE_URL || 'http://localhost:3001/api',
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
  },

  // Test users
  users: {
    admin: {
      email: process.env.PLAYWRIGHT_TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.PLAYWRIGHT_TEST_ADMIN_PASSWORD || 'admin1234',
    },
    user: {
      email: process.env.PLAYWRIGHT_TEST_USER_EMAIL || 'user@example.com',
      password: process.env.PLAYWRIGHT_TEST_USER_PASSWORD || 'user1234',
    },
  },

  // Test data
  testData: {
    // Default RFQ data
    defaultRFQ: {
      productName: 'Test RFQ',
      description: 'This is a test RFQ',
      quantity: 10,
      targetPrice: 100,
      unit: 'pcs',
      category: 'Test Category',
      priority: 'medium' as const,
    },
    
    // Default user data
    defaultUser: {
      name: 'Test User',
      email: 'test.user@example.com',
      password: 'Test@1234',
      company: 'Test Company',
      phone: '+1234567890',
    },
  },

  // Test settings
  settings: {
    // Screenshots
    screenshots: {
      enabled: process.env.TEST_SCREENSHOTS_ENABLED !== 'false',
      path: 'test-results/screenshots',
    },
    
    // Videos
    videos: {
      enabled: process.env.TEST_VIDEOS_ENABLED !== 'false',
      path: 'test-results/videos',
    },
    
    // Trace
    trace: {
      enabled: process.env.TEST_TRACE_ENABLED === 'true',
      path: 'test-results/traces',
    },
    
    // Retries
    retries: {
      // Number of retries for each test
      testRetries: parseInt(process.env.TEST_RETRIES || '0', 10),
      // Number of retries in the CI pipeline
      ciRetries: parseInt(process.env.CI_TEST_RETRIES || '1', 10),
    },
    
    // Timeouts (in milliseconds)
    timeouts: {
      // Default test timeout
      test: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
      // Default expect timeout
      expect: parseInt(process.env.EXPECT_TIMEOUT || '5000', 10),
      // Default action timeout (clicks, fill, etc.)
      action: parseInt(process.env.ACTION_TIMEOUT || '5000', 10),
      // Default navigation timeout
      navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '30000', 10),
    },
  },

  // Environment
  env: {
    // Current environment (test, development, production)
    name: process.env.NODE_ENV || 'test',
    // Is CI environment
    isCI: !!process.env.CI,
    // Is development environment
    isDev: process.env.NODE_ENV === 'development',
    // Is test environment
    isTest: process.env.NODE_ENV === 'test',
    // Is production environment
    isProd: process.env.NODE_ENV === 'production',
  },

  // API configuration
  api: {
    // API version
    version: process.env.API_VERSION || 'v1',
    // API prefix
    prefix: process.env.API_PREFIX || '/api',
    // API timeout
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    // API retries
    retries: parseInt(process.env.API_RETRIES || '3', 10),
    // API retry delay (ms)
    retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000', 10),
  },

  // Database configuration
  db: {
    // Database URL
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/test',
    // Database name
    name: process.env.DATABASE_NAME || 'test',
    // Database sync (true = drop and recreate tables)
    sync: process.env.DATABASE_SYNC === 'true',
    // Database logging (true = log SQL queries)
    logging: process.env.DATABASE_LOGGING === 'true',
  },

  // Authentication
  auth: {
    // JWT secret
    jwtSecret: process.env.JWT_SECRET || 'test-secret',
    // JWT expiration
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    // Password salt rounds
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10),
  },
};

// Export the config as default
export default config;

// Export types
export type TestConfig = typeof config;
