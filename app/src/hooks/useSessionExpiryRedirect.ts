import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { setSessionExpiredHandler } from '@/lib/api'

export function useSessionExpiryRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    setSessionExpiredHandler(() => {
      navigate('/login', {
        replace: true,
        state: { sessionExpired: true },
      })
    })

    return () => {
      setSessionExpiredHandler(null)
    }
  }, [navigate])
}
