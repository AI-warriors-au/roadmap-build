import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, useSearchParams } from 'react-router-dom'

import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser'

/**
 * Handles the post-OAuth redirect from the API:
 * `{APP_ORIGIN}/#/auth/callback?new=true|false` or `?error=oauth_failed`.
 *
 * Onboarding for new users is owned by a later story — both success paths
 * land on the dashboard for now.
 */
export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const error = params.get('error')

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
  }, [queryClient])

  if (error) {
    return (
      <Navigate to="/login" replace state={{ oauthError: error }} />
    )
  }

  return <Navigate to="/dashboard" replace />
}
