import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('Authentication endpoints', async ({ request }) => {
    // Test user registration
    const registerResponse = await request.post('/api/auth/register', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        role: 'BUYER',
      },
    });
    expect(registerResponse.status()).toBe(201);

    // Test login
    const loginResponse = await request.post('/api/auth/signin', {
      data: {
        email: 'test@example.com',
        password: 'Test123!@#',
      },
    });
    expect(loginResponse.status()).toBe(200);
  });

  test('RFQ endpoints', async ({ request }) => {
    // Test RFQ creation
    const rfqResponse = await request.post('/api/rfq', {
      data: {
        title: 'Test RFQ',
        description: 'Test description',
        budget: 50000,
        category: 'Electronics',
      },
    });
    expect(rfqResponse.status()).toBe(201);

    // Test RFQ listing
    const listResponse = await request.get('/api/rfq');
    expect(listResponse.status()).toBe(200);
    const rfqs = await listResponse.json();
    expect(Array.isArray(rfqs)).toBeTruthy();
  });

  test('Wallet endpoints', async ({ request }) => {
    // Test wallet creation and operations
    const walletResponse = await request.get('/api/wallet');
    expect(walletResponse.status()).toBe(200);

    const depositResponse = await request.post('/api/wallet', {
      data: {
        amount: 10000,
        type: 'DEPOSIT',
        description: 'Test deposit',
      },
    });
    expect(depositResponse.status()).toBe(200);
  });

  test('Suppliers endpoints', async ({ request }) => {
    // Test supplier search
    const searchResponse = await request.get('/api/suppliers?q=electronics');
    expect(searchResponse.status()).toBe(200);
    const suppliers = await searchResponse.json();
    expect(suppliers.suppliers).toBeDefined();
  });

  test('Analytics endpoints', async ({ request }) => {
    // Test analytics endpoint
    const analyticsResponse = await request.get('/api/analytics');
    expect(analyticsResponse.status()).toBe(200);
    const analytics = await analyticsResponse.json();
    expect(analytics.overview).toBeDefined();
  });
});
