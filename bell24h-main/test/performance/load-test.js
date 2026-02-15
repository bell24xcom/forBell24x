import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const rfqCreationDuration = new Trend('rfq_creation_duration');
const searchDuration = new Trend('search_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    errors: ['rate<0.1'],            // Error rate should be less than 10%
    login_duration: ['p(95)<2000'],  // 95% of login requests should be below 2s
    rfq_creation_duration: ['p(95)<3000'], // 95% of RFQ creation should be below 3s
    search_duration: ['p(95)<1000'], // 95% of search requests should be below 1s
  },
};

// Test data
const BASE_URL = 'https://bell24h.com/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

// Helper functions
function login() {
  const startTime = new Date();
  const response = http.post(`${BASE_URL}/auth/login`, {
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  loginDuration.add(new Date() - startTime);
  check(response, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  return response.json('token');
}

function createRFQ(token) {
  const startTime = new Date();
  const response = http.post(
    `${BASE_URL}/rfq/create`,
    {
      title: 'Load Test RFQ',
      description: 'This is a load test RFQ',
      category: 'agriculture',
      subcategory: 'seeds',
      quantity: 100,
      budget: 1000,
      timeline: '30 days',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  rfqCreationDuration.add(new Date() - startTime);
  check(response, {
    'RFQ creation successful': (r) => r.status === 201,
    'has RFQ ID': (r) => r.json('id') !== undefined,
  });

  return response.json('id');
}

function searchRFQs(token) {
  const startTime = new Date();
  const response = http.get(
    `${BASE_URL}/rfq/search?query=test&category=agriculture`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  searchDuration.add(new Date() - startTime);
  check(response, {
    'search successful': (r) => r.status === 200,
    'has results': (r) => Array.isArray(r.json('results')),
  });
}

// Main test function
export default function () {
  // Login and get token
  const token = login();
  if (!token) {
    errorRate.add(1);
    return;
  }

  // Create RFQ
  const rfqId = createRFQ(token);
  if (!rfqId) {
    errorRate.add(1);
    return;
  }

  // Search RFQs
  searchRFQs(token);

  // Sleep between iterations
  sleep(1);
}

// Setup and teardown
export function setup() {
  // Any setup code (e.g., creating test data)
  return {};
}

export function teardown(data) {
  // Any cleanup code (e.g., removing test data)
} 