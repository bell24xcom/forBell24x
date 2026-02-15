import React, { useMemo } from 'react';
import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import { getClientQueryClient } from './queryClient.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * QueryClient configuration for Bell24H
 * Centralizes data fetching and caching
 */
// Removed direct instantiation of QueryClient. Will use getClientQueryClient from queryClient.ts
/*
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      gcTime: 10 * 60 * 1000, // 10 minutes
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
*/

/**
 * Base API request function for all API calls
 * Handles authentication, headers, and error handling
 */
export const apiRequest = async (
  method: string,
  url: string,
  data?: any,
  customHeaders?: Record<string, string>
) => {
  // Build request options
  const options: RequestInit = {
    method,
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  };

  // Add body if data is provided (for POST, PUT, etc.)
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    // Handle unauthorized responses
    if (response.status === 401) {
      // Redirect to login or refresh token
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return Promise.reject('Unauthorized');
    }

    // Handle other error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return Promise.reject(errorText);
    }

    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
};

/**
 * QueryClientProvider component to wrap the application
 */
export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useMemo(() => getClientQueryClient(), []);
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </TanstackQueryClientProvider>
  );
};
