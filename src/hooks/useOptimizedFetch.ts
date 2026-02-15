import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Cache interface
interface Cache<T> {
  [key: string]: {
    data: T;
    timestamp: number;
    expiresAt: number;
  };
}

// Request queue interface
interface RequestQueue<T> {
  [key: string]: Array<{
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
  }>;
}

// Default cache TTL (5 minutes)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// In-memory cache
const cache: Cache<any> = {};

// In-flight request queue
const requestQueue: RequestQueue<any> = {};

/**
 * Custom hook for optimized data fetching with caching and request deduplication
 * @param fetchFn The fetch function that returns a promise
 * @param options Configuration options
 */
export function useOptimizedFetch<T>(
  fetchFn: (signal?: AbortSignal) => Promise<T>,
  options: {
    key: string;
    enabled?: boolean;
    cacheTime?: number;
    staleTime?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = { key: uuidv4() }
) {
  const {
    key,
    enabled = true,
    cacheTime = DEFAULT_CACHE_TTL,
    staleTime = 0,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef<boolean>(true);

  // Check if cached data is stale
  const isCacheStale = useCallback((cachedItem: { timestamp: number }) => {
    return Date.now() - cachedItem.timestamp > staleTime;
  }, [staleTime]);

  // Fetch data function
  const fetchData = useCallback(async (): Promise<T> => {
    // Return cached data if available and not stale
    if (cache[key] && !isCacheStale(cache[key])) {
      return cache[key].data;
    }

    // If there's already a request in progress, wait for it
    if (requestQueue[key]?.length > 0) {
      return new Promise<T>((resolve, reject) => {
        requestQueue[key].push({ resolve, reject });
      });
    }

    // Initialize request queue for this key
    requestQueue[key] = [];

    try {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // Make the API call
      const response = await fetchFn(signal);

      // Update cache
      const now = Date.now();
      cache[key] = {
        data: response,
        timestamp: now,
        expiresAt: now + cacheTime,
      };

      // Resolve all queued requests
      requestQueue[key].forEach(({ resolve }) => resolve(response));

      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      
      // Reject all queued requests
      if (requestQueue[key]) {
        requestQueue[key].forEach(({ reject }) => reject(error));
      }
      
      throw error;
    } finally {
      // Clean up request queue
      delete requestQueue[key];
    }
  }, [key, fetchFn, cacheTime, isCacheStale]);

  // Fetch data and update state
  const execute = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData();
      
      if (isMounted.current) {
        setData(result);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      
      if (isMounted.current) {
        setError(error);
        onError?.(error);
      }
      
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, fetchData, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    // Check cache first
    if (cache[key]) {
      setData(cache[key].data);
      
      // Mark as stale if needed
      if (isCacheStale(cache[key])) {
        setIsStale(true);
      }
      
      // Refresh in background if stale
      if (staleTime > 0 && isCacheStale(cache[key])) {
        execute().catch(console.error);
      }
    } else {
      // No cache, fetch immediately
      execute().catch(console.error);
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
      
      // Abort in-flight request if component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, execute, key, isCacheStale, staleTime]);

  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(cache).forEach((cacheKey) => {
        if (cache[cacheKey]?.expiresAt < now) {
          delete cache[cacheKey];
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch: execute,
    updateCache: (updater: (currentData: T | null) => T) => {
      if (cache[key]) {
        const updatedData = updater(cache[key].data);
        cache[key] = {
          ...cache[key],
          data: updatedData,
          timestamp: Date.now(),
        };
        setData(updatedData);
        return updatedData;
      }
      return null;
    },
    clearCache: () => {
      delete cache[key];
      setData(null);
    },
  };
}

// Example usage:
/*
const { data, isLoading, error, refetch } = useOptimizedFetch(
  async (signal) => {
    const response = await fetch('/api/data', { signal });
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  },
  {
    key: 'data-fetch', // Unique key for this query
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 0, // Considered stale immediately
    onSuccess: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Error loading data:', error),
  }
);
*/
