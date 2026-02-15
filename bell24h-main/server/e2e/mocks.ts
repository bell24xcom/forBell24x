import { Page, APIResponse } from '@playwright/test';
import { RFQData } from './test-utils';

/**
 * Mocks API responses for testing
 */
class ApiMocks {
  constructor(private page: Page) {}

  /**
   * Mocks the login API response
   */
  async mockLoginResponse(
    status: number = 200,
    response: any = { token: 'test-jwt-token' },
    urlPattern: string | RegExp = /\/api\/auth\/login/
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mocks the current user API response
   */
  async mockCurrentUserResponse(
    userData: any = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    },
    status: number = 200,
    urlPattern: string | RegExp = /\/api\/auth\/me/
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(userData),
      });
    });
  }

  /**
   * Mocks the RFQ list API response
   */
  async mockRfqListResponse(
    rfqs: Partial<RFQData>[] = [],
    status: number = 200,
    urlPattern: string | RegExp = /\/api\/rfqs/
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      // Only mock GET requests for listing RFQs
      if (route.request().method() === 'GET') {
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(rfqs),
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * Mocks the create RFQ API response
   */
  async mockCreateRfqResponse(
    rfqData: Partial<RFQData>,
    status: number = 201,
    urlPattern: string | RegExp = /\/api\/rfqs/
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      if (route.request().method() === 'POST') {
        const response = {
          id: `rfq-${Date.now()}`,
          ...rfqData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

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
   * Mocks a generic API error response
   */
  async mockErrorResponse(
    status: number = 500,
    error: any = { message: 'Internal Server Error' },
    urlPattern: string | RegExp = /\/api\//
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: error.message || 'An error occurred',
          ...error,
        }),
      });
    });
  }

  /**
   * Mocks a network error for a specific API endpoint
   */
  async mockNetworkError(
    urlPattern: string | RegExp = /\/api\//
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      route.abort('failed');
    });
  }

  /**
   * Mocks a delayed API response
   */
  async mockDelayedResponse(
    delay: number = 1000,
    response: any = { status: 'ok' },
    status: number = 200,
    urlPattern: string | RegExp = /\/api\//
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      setTimeout(() => {
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(response),
        });
      }, delay);
    });
  }

  /**
   * Clears all mocks
   */
  async clearMocks(): Promise<void> {
    await this.page.unroute(/\/api\//);
  }
}

export default ApiMocks;

// Helper functions for common mock scenarios
export const mockSuccessfulLogin = async (page: Page, userData: any = {}) => {
  const mocks = new ApiMocks(page);
  await mocks.mockLoginResponse(200, { token: 'test-jwt-token' });
  await mocks.mockCurrentUserResponse({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...userData,
  });
};

export const mockEmptyRfqList = async (page: Page) => {
  const mocks = new ApiMocks(page);
  await mocks.mockRfqListResponse([]);
};

export const mockRfqListWithItems = async (page: Page, items: Partial<RFQData>[] = []) => {
  const mocks = new ApiMocks(page);
  await mocks.mockRfqListResponse([
    {
      id: 'rfq-1',
      productName: 'Test Product 1',
      description: 'Test Description 1',
      quantity: 10,
      targetPrice: 100,
      unit: 'pcs',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rfq-2',
      productName: 'Test Product 2',
      description: 'Test Description 2',
      quantity: 20,
      targetPrice: 200,
      unit: 'kg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ...items,
  ]);
};
