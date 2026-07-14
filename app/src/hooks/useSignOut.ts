import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser'
import { postLogout } from '@/lib/api'

export function useSignOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(async () => {
    await postLogout()
    queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    navigate('/login', { replace: true })
  }, [navigate, queryClient])
}
