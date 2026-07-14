import { Navigate, useSearchParams } from 'react-router-dom'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import { AuthLoadingState } from '@/components/auth/AuthLoadingState'

/**
 * Handles the post-OAuth redirect from the API:
 * `{APP_ORIGIN}/#/auth/callback?new=true|false` or `?error=oauth_failed`.
 */
export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const error = params.get('error')

  if (error) {
    return (
      <Navigate to="/login" replace state={{ oauthError: error }} />
    )
  }

  return <SuccessfulAuthCallback isNewUser={params.get('new') === 'true'} />
}

function SuccessfulAuthCallback({ isNewUser }: { isNewUser: boolean }) {
  const { user, isLoading, isAuthenticated } = useCurrentUser()

  if (isLoading) {
    return <AuthLoadingState />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const needsOnboarding = isNewUser || !user.onboardedAt

  return (
    <Navigate to={needsOnboarding ? '/onboarding' : '/dashboard'} replace />
  )
}
