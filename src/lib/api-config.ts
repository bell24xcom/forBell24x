/**
 * API Configuration for Bell24H
 * Allows switching between production and test APIs during development
 */

// Default API base URL (production)
const PROD_API_BASE = '/api';

// Test server API base URL
const TEST_API_BASE = 'http://localhost:3001/api';

// Environment variable name to check for test mode
const TEST_MODE_ENV = 'REACT_APP_USE_TEST_API';

// Check if we're in test mode (using test server)
export const isTestMode = (): boolean => {
  // Check for environment variable
  if (process.env[TEST_MODE_ENV] === 'true') {
    return true;
  }

  // Check for URL parameter for easy toggling during development
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('useTestApi') === 'true';
  }

  return false;
};

// Get the appropriate API base URL based on current mode
export const getApiBaseUrl = (): string => {
  return isTestMode() ? TEST_API_BASE : PROD_API_BASE;
};

// Helper to build full API endpoint URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();

  // Remove leading slash from endpoint if present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

  return `${baseUrl}/${normalizedEndpoint}`;
};

// Return configuration object for the current environment
export const getApiConfig = () => {
  return {
    baseUrl: getApiBaseUrl(),
    isTestMode: isTestMode(),
    headers: {
      'Content-Type': 'application/json',
      // Add any additional headers needed for both environments
    },
  };
};
