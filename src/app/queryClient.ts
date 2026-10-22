import { QueryClient } from '@tanstack/react-query'
import { isRetryable } from '../shared/api/ApiError'

// Retry a network or server failure once; parse and not-found errors won't change on retry.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => failureCount < 1 && isRetryable(error),
        refetchOnWindowFocus: false,
      },
    },
  })
}
