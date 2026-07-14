import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMe } from '@/lib/api'

import {
  CURRENT_USER_QUERY_KEY,
  useCurrentUser,
} from './useCurrentUser'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getMe: vi.fn(),
  }
})

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
  })

  it('exposes the authenticated user', async () => {
    vi.mocked(getMe).mockResolvedValue({
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.displayName).toBe('Ada')
  })

  it('treats 401 as logged out', async () => {
    vi.mocked(getMe).mockRejectedValue(
      Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401 },
      }),
    )

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isUnauthorized).toBe(true)
    expect(result.current.user).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  it('does not authenticate with cached profile data after a 401 refetch', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    client.setQueryData(
      CURRENT_USER_QUERY_KEY,
      {
        id: 'user-1',
        email: 'ada@example.com',
        displayName: 'Ada',
        avatarUrl: null,
        onboardedAt: null,
      },
      { updatedAt: 1 },
    )
    let rejectRequest!: (reason?: unknown) => void
    vi.mocked(getMe).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject
        }),
    )

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>
          {children}
        </QueryClientProvider>
      ),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)

    rejectRequest(
      Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401 },
      }),
    )

    await waitFor(() => {
      expect(result.current.isUnauthorized).toBe(true)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('keeps cached user data during background refetch errors', async () => {
    vi.mocked(getMe).mockResolvedValue({
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    })

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0 } },
    })
    client.setQueryData(CURRENT_USER_QUERY_KEY, {
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    })

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.displayName).toBe('Ada')
  })
})
