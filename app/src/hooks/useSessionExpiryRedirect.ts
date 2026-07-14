import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser'
import { setSessionExpiredHandler } from '@/lib/api'

export function useSessionExpiryRedirect() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      navigate('/login', {
        replace: true,
        state: { sessionExpired: true },
      })
    })

    return () => {
      setSessionExpiredHandler(null)
    }
  }, [navigate, queryClient])
}
