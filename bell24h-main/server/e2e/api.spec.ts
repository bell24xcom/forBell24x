import { test, expect } from '@playwright/test';

// Test suite for API endpoints
test.describe('API Endpoints', () => {
  const baseUrl = 'http://localhost:3001';

  // Test case: Health check endpoint
  test('should respond to health check', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
  });

  // Test case: Login endpoint
  test('should authenticate with valid credentials', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
  });

  // Test case: Protected route without authentication
  test('should reject unauthenticated requests to protected routes', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/rfqs`);
    expect(response.status()).toBe(401);
  });
});
