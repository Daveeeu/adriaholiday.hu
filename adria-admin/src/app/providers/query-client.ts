import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // A missing login or permission does not fix itself on a second try.
      retry: (failureCount, error) =>
        !(
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
});
