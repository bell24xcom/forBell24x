import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { fetchWithTimeout, createQueryKey, handleApiError, isRetryableError } from '../utils/api';

interface UseApiOptions<TData = unknown, TError = Error> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  queryOptions?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>;
}

interface UseApiMutationOptions<TData = unknown, TVariables = unknown, TError = Error> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>;
}

export function useApi<TData = unknown, TError = Error>(
  key: string[],
  url: string,
  options: UseApiOptions<TData, TError> = {}
) {
  const { timeout, retries, retryDelay, queryOptions } = options;

  return useQuery<TData, TError>({
    queryKey: createQueryKey(key, { timeout }),
    queryFn: async () => {
      const response = await fetchWithTimeout(url, {
        timeout,
        retries,
        retryDelay,
      });
      return response.json();
    },
    retry: (failureCount, error) => {
      if (!isRetryableError(error)) return false;
      return failureCount < (retries ?? 2);
    },
    ...queryOptions,
  });
}

export function useApiMutation<TData = unknown, TVariables = unknown, TError = Error>(
  url: string,
  options: UseApiMutationOptions<TData, TVariables, TError> = {}
) {
  const { timeout, retries, retryDelay, mutationOptions } = options;

  return useMutation<TData, TError, TVariables>({
    mutationFn: async variables => {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
        timeout,
        retries,
        retryDelay,
      });
      return response.json();
    },
    ...mutationOptions,
  });
}

// Example usage:
/*
const { data, isLoading, error } = useApi(
  ['todos'],
  '/api/todos',
  {
    timeout: 5000,
    retries: 3,
    queryOptions: {
      staleTime: 5 * 60 * 1000,
    },
  }
);

const { mutate, isLoading } = useApiMutation(
  '/api/todos',
  {
    timeout: 5000,
    retries: 2,
    mutationOptions: {
      onSuccess: () => {
        // Handle success
      },
    },
  }
);
*/
