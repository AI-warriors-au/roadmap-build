import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'

import { createMockUser } from '@/contexts/AuthContext'
import * as apiModule from '@/lib/api'

import { CURRENT_USER_QUERY_KEY } from './useCurrentUser'
import { useSessionExpiryRedirect } from './useSessionExpiryRedirect'

function LocationState() {
  const location = useLocation()
  return (
    <div
      data-testid="location"
      data-session-expired={String(
        (location.state as { sessionExpired?: boolean } | null)?.sessionExpired ??
          false,
      )}
    >
      {location.pathname}
    </div>
  )
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          {children}
          <LocationState />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('useSessionExpiryRedirect', () => {
  afterEach(() => {
    apiModule.setSessionExpiredHandler(null)
    vi.restoreAllMocks()
  })

  it('navigates to login with session-expired state when the handler fires', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, createMockUser())
    const setHandlerSpy = vi.spyOn(apiModule, 'setSessionExpiredHandler')

    renderHook(() => useSessionExpiryRedirect(), {
      wrapper: createWrapper(queryClient),
    })

    const registeredHandler = setHandlerSpy.mock.calls
      .map(([handler]) => handler)
      .find((handler): handler is () => void => typeof handler === 'function')

    expect(registeredHandler).toBeTypeOf('function')

    act(() => {
      registeredHandler!()
    })

    await waitFor(() => {
      const location = document.querySelector('[data-testid="location"]')
      expect(location).toHaveTextContent('/login')
      expect(location).toHaveAttribute('data-session-expired', 'true')
    })
    expect(queryClient.getQueryData(CURRENT_USER_QUERY_KEY)).toBeUndefined()
  })

  it('clears the handler on unmount', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const setHandlerSpy = vi.spyOn(apiModule, 'setSessionExpiredHandler')

    const { unmount } = renderHook(() => useSessionExpiryRedirect(), {
      wrapper: createWrapper(queryClient),
    })
    unmount()

    expect(setHandlerSpy).toHaveBeenLastCalledWith(null)
  })
})
