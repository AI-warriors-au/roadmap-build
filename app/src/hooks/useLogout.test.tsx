import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { logout } from '@/lib/api'

import { CURRENT_USER_QUERY_KEY } from './useCurrentUser'
import { useLogout } from './useLogout'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    logout: vi.fn(),
  }
})

describe('useLogout', () => {
  beforeEach(() => {
    vi.mocked(logout).mockReset()
  })

  it('clears the cached user when logout fails', async () => {
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    client.setQueryData(CURRENT_USER_QUERY_KEY, {
      id: 'user-1',
      email: 'sam@example.com',
      displayName: 'Sam Rivers',
      avatarUrl: null,
      onboardedAt: null,
    })
    vi.mocked(logout).mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useLogout(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(client.getQueryData(CURRENT_USER_QUERY_KEY)).toBeUndefined()
  })
})
