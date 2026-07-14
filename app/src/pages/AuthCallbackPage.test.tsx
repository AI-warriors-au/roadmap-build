import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockUser } from '@/contexts/AuthContext'
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

const notOnboardedUser = createMockUser({ onboardedAt: null })
const onboardedUser = createMockUser()

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(getMe).mockResolvedValue(notOnboardedUser)
  })

  it('redirects returning OAuth callbacks to the dashboard', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/auth/callback?new=false',
      authUser: onboardedUser,
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Dashboard' }),
      ).toBeInTheDocument()
    })
  })

  it('redirects returning but not-yet-onboarded OAuth callbacks to onboarding', async () => {
    renderWithProviders(<App />, {
      route: '/auth/callback?new=false',
      authUser: notOnboardedUser,
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Display name')).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('heading', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
  })

  it('redirects new-user OAuth callbacks to onboarding', async () => {
    renderWithProviders(<App />, {
      route: '/auth/callback?new=true',
      authUser: notOnboardedUser,
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Welcome to Learnmap' }),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Display name')).toBeInTheDocument()
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
