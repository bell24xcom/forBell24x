import { expect, request, test } from '@playwright/test';

// Adjust sample payloads as your handlers expect.
const API_GET = [
  '/api/health',
  '/api/campaigns',
  '/api/transactions',
];

const API_POST = [
  // ['/api/auth/agent/login', { email: 'test@example.com', password: 'not-real' }],
  ['/api/ugc/upload', { filename: 'smoke.txt', contentType: 'text/plain' }],
];

test.describe('API endpoints', () => {
  test('GET endpoints return 2xx', async ({ baseURL }) => {
    const api = await request.newContext({ baseURL });
    for (const route of API_GET) {
      const res = await api.get(route);
      expect(res.ok(), `${route} should be OK`).toBeTruthy();
      // Ensure JSON or valid text
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('application/json')) {
        await expect(async () => { await res.json(); }).not.toThrow();
      }
    }
  });

  test('POST endpoints accept minimal payload', async ({ baseURL }) => {
    const api = await request.newContext({ baseURL });
    for (const [route, payload] of API_POST as [string, any][]) {
      const res = await api.post(route, { data: payload });
      expect([200, 201, 202, 204]).toContain(res.status());
    }
  });
});
