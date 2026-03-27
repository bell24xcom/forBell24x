import { QueryClient } from '@tanstack/react-query';

interface ApiOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & ApiOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    signal,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Combine the provided signal with our timeout signal
      const combinedSignal = signal ? new AbortController().signal : controller.signal;

      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1') * 1000;
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }

      // Handle server errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if the request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request to ${url} timed out after ${timeout}ms`);
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} retries`);
}

// Helper function to create a query key with timeout
export function createQueryKey(baseKey: string[], options?: { timeout?: number }): string[] {
  return [...baseKey, `timeout:${options?.timeout || DEFAULT_TIMEOUT}`];
}

// Helper function to handle API errors
export function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error('An unexpected error occurred');
}

// Helper function to check if an error is retryable
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const retryableErrors = [
    'NetworkError',
    'TimeoutError',
    'AbortError',
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
  ];

  return retryableErrors.some(type => error.name.includes(type) || error.message.includes(type));
}
