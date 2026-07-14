import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMe, logout } from '@/lib/api'

import { CURRENT_USER_QUERY_KEY, useCurrentUser } from './useCurrentUser'
import { useLogout } from './useLogout'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getMe: vi.fn(),
    logout: vi.fn(),
  }
})

describe('useLogout', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(logout).mockReset()
  })

  it('keeps the current user signed out when logout fails', async () => {
    const client = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    })
    vi.mocked(getMe).mockResolvedValue({
      id: 'user-1',
      email: 'sam@example.com',
      displayName: 'Sam Rivers',
      avatarUrl: null,
      onboardedAt: null,
    })
    vi.mocked(logout).mockRejectedValue(new Error('network down'))

    const { result } = renderHook(
      () => ({
        currentUser: useCurrentUser(),
        logout: useLogout(),
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={client}>
            <MemoryRouter>{children}</MemoryRouter>
          </QueryClientProvider>
        ),
      },
    )

    await waitFor(() => {
      expect(result.current.currentUser.isAuthenticated).toBe(true)
    })

    act(() => {
      result.current.logout.mutate()
    })

    await waitFor(() => {
      expect(result.current.logout.isError).toBe(true)
    })

    expect(result.current.currentUser.isAuthenticated).toBe(false)
    expect(client.getQueryData(CURRENT_USER_QUERY_KEY)).toBeNull()
    expect(getMe).toHaveBeenCalledTimes(1)
  })
})
