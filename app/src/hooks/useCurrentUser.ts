import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { getMe, type MeResponse } from '@/lib/api'

export const CURRENT_USER_QUERY_KEY = ['auth', 'me'] as const

function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

/**
 * Resolves the current user via GET /user/profile (httpOnly session cookie).
 * Treats 401 as logged-out (data undefined, isAuthenticated false).
 */
export function useCurrentUser() {
  const query = useQuery<MeResponse>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getMe,
    retry: false,
  })

  const isUnauthorizedError =
    query.isError && isUnauthorized(query.error)
  const user = isUnauthorizedError ? undefined : query.data

  return {
    user,
    isLoading: query.isPending || query.isFetching,
    isAuthenticated: Boolean(user),
    isUnauthorized: isUnauthorizedError,
    error: isUnauthorizedError ? null : query.error,
    refetch: query.refetch,
  }
}
