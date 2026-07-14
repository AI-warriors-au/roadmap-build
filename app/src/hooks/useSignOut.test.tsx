import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'

import { createMockUser } from '@/contexts/AuthContext'
import { postLogout } from '@/lib/api'

import { CURRENT_USER_QUERY_KEY } from './useCurrentUser'
import { useSignOut } from './useSignOut'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    postLogout: vi.fn(),
  }
})

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard']}>
          {children}
          <LocationDisplay />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('useSignOut', () => {
  beforeEach(() => {
    vi.mocked(postLogout).mockReset()
    vi.mocked(postLogout).mockResolvedValue(undefined)
  })

  it('logs out, clears cached user data, and navigates to login', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, createMockUser())

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current()

    expect(postLogout).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(CURRENT_USER_QUERY_KEY)).toBeUndefined()

    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')).toHaveTextContent(
        '/login',
      )
    })
  })

  it('still clears local auth state when logout fails', async () => {
    vi.mocked(postLogout).mockRejectedValue(new Error('Network error'))

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, createMockUser())

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current()

    expect(queryClient.getQueryData(CURRENT_USER_QUERY_KEY)).toBeUndefined()
    await waitFor(() => {
      expect(document.querySelector('[data-testid="location"]')).toHaveTextContent(
        '/login',
      )
    })
  })
})
