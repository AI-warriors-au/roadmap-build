import { Navigate, useSearchParams } from 'react-router-dom'

import { useCurrentUser } from '@/hooks/useCurrentUser'

/**
 * Handles the post-OAuth redirect from the API:
 * `{APP_ORIGIN}/#/auth/callback?new=true|false` or `?error=oauth_failed`.
 *
 * Onboarding for new users is owned by a later story — both success paths
 * land on the dashboard for now.
 */
export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const error = params.get('error')

  if (error) {
    return (
      <Navigate to="/login" replace state={{ oauthError: error }} />
    )
  }

  return <SuccessfulAuthCallback />
}

function SuccessfulAuthCallback() {
  const { isLoading } = useCurrentUser({ forceSessionCheck: true })

  if (isLoading) {
    return null
  }

  return <Navigate to="/dashboard" replace />
}
