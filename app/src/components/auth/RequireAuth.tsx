import { Navigate, Outlet } from 'react-router-dom'

import { useCurrentUser } from '@/hooks/useCurrentUser'

import { AuthLoadingState } from './AuthLoadingState'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useCurrentUser()

  if (isLoading) {
    return <AuthLoadingState />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
