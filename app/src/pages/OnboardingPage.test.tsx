import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockUser } from '@/contexts/AuthContext'
import { getMe, onboardUser, postLogout } from '@/lib/api'
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
    onboardUser: vi.fn(),
    postLogout: vi.fn(),
  }
})

const notOnboardedUser = createMockUser({
  displayName: 'Ada',
  onboardedAt: null,
})
const onboardedUser = createMockUser({
  displayName: 'Ada',
  onboardedAt: '2026-01-15T00:00:00.000Z',
})

function unauthorizedError() {
  return Object.assign(new Error('Unauthorized'), {
    isAxiosError: true,
    response: { status: 401 },
  })
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(getMe).mockResolvedValue(notOnboardedUser)
    vi.mocked(onboardUser).mockReset()
    vi.mocked(onboardUser).mockResolvedValue(onboardedUser)
  })

  it('pre-fills the display name and submits onboarding', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />, {
      route: '/onboarding',
      authUser: notOnboardedUser,
    })

    const input = await screen.findByLabelText('Display name')
    expect(input).toHaveValue('Ada')

    await user.clear(input)
    await user.type(input, 'Ada Lovelace')
    await user.click(
      screen.getByRole('button', { name: 'Continue to dashboard' }),
    )

    await waitFor(() => {
      expect(onboardUser).toHaveBeenCalledWith(
        { displayName: 'Ada Lovelace' },
        expect.anything(),
      )
    })
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('disables continue when the display name is cleared', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />, {
      route: '/onboarding',
      authUser: notOnboardedUser,
    })

    const input = await screen.findByLabelText('Display name')
    await user.clear(input)

    expect(
      screen.getByRole('button', { name: 'Continue to dashboard' }),
    ).toBeDisabled()
  })

  it('redirects onboarded users away from onboarding', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/onboarding',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Display name')).not.toBeInTheDocument()
  })
})

describe('Sign out', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)
    vi.mocked(postLogout).mockImplementation(async () => {
      vi.mocked(getMe).mockRejectedValue(unauthorizedError())
    })
  })

  it('calls logout and returns to the login page', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    renderWithProviders(<App />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    await user.click(await screen.findByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    await waitFor(() => {
      expect(postLogout).toHaveBeenCalledOnce()
    })
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Learnmap' }),
    ).toBeInTheDocument()
  })
})
