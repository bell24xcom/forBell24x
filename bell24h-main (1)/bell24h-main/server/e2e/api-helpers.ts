import { APIRequestContext, APIResponse } from '@playwright/test';
import { RFQData } from './test-utils';

// API endpoints
const API_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001/api';

interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: any;
  token?: string;
}

/**
 * Creates a new API client with default headers
 * @param request - The Playwright APIRequestContext
 * @param baseURL - The base URL for the API
 * @param defaultHeaders - Default headers to include in all requests
 */
export const createApiClient = (
  request: APIRequestContext,
  baseURL: string = API_BASE_URL,
  defaultHeaders: Record<string, string> = {}
) => {
  return {
    get: async (path: string, options: ApiOptions = {}) => {
      const headers = { ...defaultHeaders, ...options.headers };
      return await request.get(`${baseURL}${path}`, { headers, ...options });
    },
    post: async (path: string, options: ApiOptions = {}) => {
      const headers = { ...defaultHeaders, ...options.headers };
      return await request.post(`${baseURL}${path}`, { headers, ...options });
    },
    put: async (path: string, options: ApiOptions = {}) => {
      const headers = { ...defaultHeaders, ...options.headers };
      return await request.put(`${baseURL}${path}`, { headers, ...options });
    },
    delete: async (path: string, options: ApiOptions = {}) => {
      const headers = { ...defaultHeaders, ...options.headers };
      return await request.delete(`${baseURL}${path}`, { headers, ...options });
    },
    patch: async (path: string, options: ApiOptions = {}) => {
      const headers = { ...defaultHeaders, ...options.headers };
      return await request.patch(`${baseURL}${path}`, { headers, ...options });
    }
  };
};

// RFQ API helpers
export const createRfqApi = (request: APIRequestContext) => {
  const client = createApiClient(request);

  return {
    createRfq: async (rfqData: RFQData, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.post('/rfqs', {
        headers,
        data: rfqData
      });
    },
    getRfqs: async (token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.get('/rfqs', { headers });
    },
    updateRfq: async (id: string, rfqData: Partial<RFQData>, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.put(`/rfqs/${id}`, {
        headers,
        data: rfqData
      });
    },
    deleteRfq: async (id: string, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.delete(`/rfqs/${id}`, { headers });
    },
    matchSuppliers: async (rfqId: string, suppliers: string[], token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.post(`/rfqs/${rfqId}/match-suppliers`, {
        headers,
        data: { supplierIds: suppliers }
      });
    },
    getMatches: async (rfqId: string, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.get(`/rfqs/${rfqId}/matches`, { headers });
    }
  };
};

// Supplier API helpers
export const createSupplierApi = (request: APIRequestContext) => {
  const client = createApiClient(request);

  return {
    createSupplier: async (supplierData: any, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.post('/suppliers', {
        headers,
        data: supplierData
      });
    },
    getSuppliers: async (token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.get('/suppliers', { headers });
    },
    updateSupplier: async (id: string, supplierData: Partial<any>, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.put(`/suppliers/${id}`, {
        headers,
        data: supplierData
      });
    },
    deleteSupplier: async (id: string, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.delete(`/suppliers/${id}`, { headers });
    },
    getSupplierMatches: async (supplierId: string, token?: string) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await client.get(`/suppliers/${supplierId}/matches`, { headers });
    }
  };
};

// Auth API helpers
export const createAuthApi = (request: APIRequestContext) => {
  const client = createApiClient(request);

  return {
    login: async (email: string, password: string) => {
      return await client.post('/auth/login', {
        data: { email, password }
      });
    },
    register: async (userData: any) => {
      return await client.post('/auth/register', {
        data: userData
      });
    },
    logout: async (token: string) => {
      const headers = { Authorization: `Bearer ${token}` };
      return await client.post('/auth/logout', { headers });
    },
    refreshToken: async (refreshToken: string) => {
      return await client.post('/auth/refresh', {
        data: { refreshToken }
      });
    }
  };
};

// Creates all API helpers
export const createApiHelpers = (request: APIRequestContext) => {
  return {
    rfq: createRfqApi(request),
    supplier: createSupplierApi(request),
    auth: createAuthApi(request)
  };
};

// Export types
export type ApiClient = ReturnType<typeof createApiClient>;
export type RfqApi = ReturnType<typeof createRfqApi>;
export type SupplierApi = ReturnType<typeof createSupplierApi>;
export type AuthApi = ReturnType<typeof createAuthApi>;
export type ApiHelpers = ReturnType<typeof createApiHelpers>;
