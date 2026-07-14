import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { logout } from '@/lib/api'

import { CURRENT_USER_QUERY_KEY } from './useCurrentUser'

/**
 * Signs the user out.
 *
 * On both success and failure the local session state is cleared (the
 * current-user query is removed) and the user is redirected to /login, so a
 * failed request never traps the user in a signed-in-looking UI. The mutation's
 * `isError`/`isPending` state is exposed so callers can surface a non-blocking
 * error and avoid a stuck control.
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      navigate('/login', { replace: true })
      // Re-fetch the current user so the UI reflects the cleared session
      // immediately (removeQueries alone does not refetch active observers,
      // leaving the nav stuck as signed-in until a manual refresh).
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      })
    },
  })
}
