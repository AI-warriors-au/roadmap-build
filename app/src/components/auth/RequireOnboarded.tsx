import { Navigate, Outlet } from 'react-router-dom'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import { AuthLoadingState } from './AuthLoadingState'

export function RequireOnboarded() {
  const { user, isLoading } = useCurrentUser()

  if (isLoading) {
    return <AuthLoadingState />
  }

  if (!user?.onboardedAt) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
