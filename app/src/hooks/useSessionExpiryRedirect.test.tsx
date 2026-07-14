import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'

import * as apiModule from '@/lib/api'

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

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/dashboard']}>
      {children}
      <LocationState />
    </MemoryRouter>
  )
}

describe('useSessionExpiryRedirect', () => {
  afterEach(() => {
    apiModule.setSessionExpiredHandler(null)
    vi.restoreAllMocks()
  })

  it('navigates to login with session-expired state when the handler fires', async () => {
    const setHandlerSpy = vi.spyOn(apiModule, 'setSessionExpiredHandler')

    renderHook(() => useSessionExpiryRedirect(), { wrapper })

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
  })

  it('clears the handler on unmount', () => {
    const setHandlerSpy = vi.spyOn(apiModule, 'setSessionExpiredHandler')

    const { unmount } = renderHook(() => useSessionExpiryRedirect(), { wrapper })
    unmount()

    expect(setHandlerSpy).toHaveBeenLastCalledWith(null)
  })
})
