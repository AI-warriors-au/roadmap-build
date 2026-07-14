import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser'
import { getMe } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import App from '@/App'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getHealth: vi.fn().mockResolvedValue({
      status: 'ok',
      database: 'connected',
    }),
    getMe: vi.fn(),
  }
})

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(getMe).mockResolvedValue({
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    })
  })

  it('redirects successful OAuth callbacks to the dashboard', async () => {
    renderWithProviders(<App />, { route: '/auth/callback?new=false' })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Dashboard' }),
      ).toBeInTheDocument()
    })
    expect(getMe).toHaveBeenCalled()
  })

  it('checks the session when logout state is cached', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/auth/callback?new=false']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(getMe).toHaveBeenCalledOnce()
    })
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('redirects new-user OAuth callbacks to the dashboard', async () => {
    renderWithProviders(<App />, { route: '/auth/callback?new=true' })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Dashboard' }),
      ).toBeInTheDocument()
    })
  })

  it('redirects OAuth failures to the login page', async () => {
    vi.mocked(getMe).mockRejectedValue(
      Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: { status: 401 },
      }),
    )

    renderWithProviders(<App />, {
      route: '/auth/callback?error=oauth_failed',
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Welcome to Learnmap' }),
      ).toBeInTheDocument()
    })
    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/sign-in with GitHub failed/i)
  })
})
