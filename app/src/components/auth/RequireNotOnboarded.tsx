import { Navigate, Outlet } from 'react-router-dom'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import { AuthLoadingState } from './AuthLoadingState'

/** Keeps /onboarding limited to authenticated users who have not onboarded yet. */
export function RequireNotOnboarded() {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) {
    return <AuthLoadingState />
  }

  if (user?.onboardedAt) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
