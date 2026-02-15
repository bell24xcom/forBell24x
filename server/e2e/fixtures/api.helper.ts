import { Page, APIRequestContext, expect } from '@playwright/test';
import { createApiHelpers, type RfqApi, type AuthApi } from '../api-helpers';
import { createAssertions } from './assertions';
import { TestDataFactory, createRFQ } from './test-data.factory';

/**
 * Helper class for API-related test operations
 */
export class ApiHelper {
  /**
   * Creates a new instance of ApiHelper
   */
  constructor(
    private page: Page,
    private request: APIRequestContext,
    private baseURL: string = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001'
  ) {}

  /**
   * Gets the API client for RFQ operations
   */
  get rfq(): RfqApi {
    return createApiHelpers(this.request).rfq;
  }

  /**
   * Gets the API client for Auth operations
   */
  get auth(): AuthApi {
    return createApiHelpers(this.request).auth;
  }

  /**
   * Gets an assertions helper
   */
  get expect() {
    return createAssertions(this.page);
  }

  /**
   * Gets a test data factory
   */
  get factory() {
    return TestDataFactory;
  }

  /**
   * Creates a new test RFQ via API
   */
  async createTestRFQ(overrides: Partial<Parameters<typeof createRFQ>[0]> = {}, token?: string) {
    const rfqData = createRFQ(overrides);
    const response = await this.rfq.create(rfqData, token);
    expect(response.status()).toBe(201);
    return { ...rfqData, ...(await response.json()) };
  }

  /**
   * Logs in a user via API and returns the auth token
   */
  async login(credentials?: { email: string; password: string }) {
    const { email, password } = credentials || {
      email: process.env.PLAYWRIGHT_TEST_USER_EMAIL || 'user@example.com',
      password: process.env.PLAYWRIGHT_TEST_USER_PASSWORD || 'user1234',
    };

    const response = await this.auth.login({ email, password });
    expect(response.status()).toBe(200);
    const { token } = await response.json();
    return token;
  }

  /**
   * Sets up authentication for API requests
   */
  async setupAuth(token: string) {
    await this.page.addInitScript((t) => {
      window.localStorage.setItem('auth_token', t);
    }, token);

    // Also set the token in the API client
    this.request = this.request.extend({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Waits for a network request to complete
   */
  async waitForRequest(urlPattern: string | RegExp, method: string = 'GET') {
    const requestPromise = this.page.waitForRequest(
      (request) =>
        (typeof urlPattern === 'string' ? request.url().includes(urlPattern) : urlPattern.test(request.url())) &&
        request.method() === method.toUpperCase()
    );

    return requestPromise;
  }

  /**
   * Waits for a network response
   */
  async waitForResponse(urlPattern: string | RegExp, status: number = 200) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        (typeof urlPattern === 'string' ? response.url().includes(urlPattern) : urlPattern.test(response.url())) &&
        response.status() === status
    );

    return responsePromise;
  }

  /**
   * Mocks a network response
   */
  async mockResponse(
    urlPattern: string | RegExp,
    response: any,
    status: number = 200,
    method: string = 'GET'
  ) {
    await this.page.route(urlPattern, (route) => {
      if (route.request().method() === method.toUpperCase()) {
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(response),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * Creates a new browser context with the given auth token
   */
  async createAuthenticatedContext(token: string) {
    return this.page.context().browser().newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: new URL(this.baseURL).origin,
            localStorage: [
              { name: 'auth_token', value: token },
            ],
          },
        ],
      },
    });
  }
}

/**
 * Creates a new instance of ApiHelper
 */
export const createApiHelper = (
  page: Page,
  request: APIRequestContext,
  baseURL?: string
): ApiHelper => new ApiHelper(page, request, baseURL);

// Re-export types for convenience
export type { RfqApi, AuthApi } from '../api-helpers';
