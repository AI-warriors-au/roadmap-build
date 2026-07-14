import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { logout, type MeResponse } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { UserMenu } from './UserMenu'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getMe: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }
})

const mockUser: MeResponse = {
  id: 'user-1',
  email: 'sam@example.com',
  displayName: 'Sam Rivers',
  avatarUrl: null,
  onboardedAt: null,
}

function setup() {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  renderWithProviders(<UserMenu user={mockUser} />, { route: '/dashboard' })
  return user
}

describe('UserMenu', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    vi.mocked(logout).mockReset()
  })

  // AC: user avatar/initials shown in top-right when authenticated
  it('renders an accessibly-named trigger with the user initials', () => {
    setup()

    const trigger = screen.getByRole('button', { name: 'Open user menu' })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('SR')
  })

  // AC: clicking the avatar opens a dropdown with name, email, Profile link, Sign out
  it('opens a menu with the profile summary and actions', async () => {
    const user = setup()

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))

    expect(await screen.findByText('Sam Rivers')).toBeInTheDocument()
    expect(screen.getByText('sam@example.com')).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /Profile & Settings/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /Sign out/ }),
    ).toBeInTheDocument()
  })

  // AC / FR-4: Profile & Settings navigates to /settings
  it('links Profile & Settings to /settings', async () => {
    const user = setup()

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))

    expect(
      await screen.findByRole('menuitem', { name: /Profile & Settings/ }),
    ).toHaveAttribute('href', '/settings')
  })

  // FR-5/6: sign out clears session and redirects to /login
  it('signs out and redirects to /login on success', async () => {
    vi.mocked(logout).mockResolvedValue(undefined)
    const user = setup()

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: /Sign out/ }))

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  // FR-7: a failed sign out must still clear local state and redirect to /login,
  // so the user is never trapped in a signed-in-looking UI.
  it('still redirects to /login when sign out fails', async () => {
    vi.mocked(logout).mockRejectedValue(new Error('network down'))
    const user = setup()

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: /Sign out/ }))

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
