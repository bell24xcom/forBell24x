import { useAuth } from '@/providers/AuthProvider';

// We'll use a function to get the refresh token when needed
let refreshAuthToken: () => Promise<boolean> = async () => {
  // This will be set by the AuthProvider
  console.warn('refreshAuthToken called before initialization');
  return false;
};

// Function to set the refresh token function from the auth context
export const setRefreshTokenFn = (fn: () => Promise<boolean>) => {
  refreshAuthToken = fn;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
  };
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Global token refresh flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage if available
  const tokens = JSON.parse(localStorage.getItem('auth_tokens') || 'null');
  const accessToken = tokens?.accessToken;

  // Add auth header if token exists
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && !isRetry && accessToken) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiRequest<T>(endpoint, options, true));
      }

      isRefreshing = true;

      try {
        const success = await refreshAuthToken();
        if (success) {
          // Retry the original request with new token
          const newTokens = JSON.parse(localStorage.getItem('auth_tokens') || 'null');
          processQueue(null, newTokens?.accessToken || null);
          return apiRequest<T>(endpoint, options, true);
        } else {
          // If refresh fails, clear auth and redirect to login
          processQueue(new Error('Session expired'));
          throw new Error('Session expired. Please log in again.');
        }
      } catch (error) {
        processQueue(error);
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    const data: ApiResponse<T> = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(data.error?.message || 'An error occurred', response.status, data.error);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific API errors
      if (error.status === 401) {
        // Clear auth and redirect to login
        localStorage.removeItem('auth_tokens');
        window.location.href = '/login';
      }
      console.error('API Error:', error.message, error.data);
    } else {
      console.error('Network Error:', error);
    }
    throw error;
  }
};

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }),

  put: <T = any>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }),

  delete: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }),
};
