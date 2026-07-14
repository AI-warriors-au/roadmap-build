import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser'
import { postLogout } from '@/lib/api'

export function useSignOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(async () => {
    try {
      await postLogout()
    } catch {
      // Local sign-out should proceed even when the API is unreachable.
    } finally {
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      navigate('/login', { replace: true })
    }
  }, [navigate, queryClient])
}
