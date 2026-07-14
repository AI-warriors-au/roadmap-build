import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockUser } from '@/contexts/AuthContext'
import { postLogout } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { UserMenu } from './UserMenu'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    postLogout: vi.fn(),
  }
})

const onboardedUser = createMockUser({
  displayName: 'Dev User',
  email: 'dev@example.com',
})

describe('UserMenu', () => {
  beforeEach(() => {
    vi.mocked(postLogout).mockReset()
    vi.mocked(postLogout).mockResolvedValue(undefined)
  })

  it('renders initials when the user has no avatar', () => {
    renderWithProviders(<UserMenu user={onboardedUser} />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    expect(screen.getByRole('button', { name: 'Open user menu' })).toBeInTheDocument()
    expect(screen.getByText('DU')).toBeInTheDocument()
  })

  it('opens the menu with display name, email, and profile link', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    renderWithProviders(<UserMenu user={onboardedUser} />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))

    expect(await screen.findByText('Dev User')).toBeInTheDocument()
    expect(screen.getByText('dev@example.com')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Profile & Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('signs out when Sign out is selected', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    renderWithProviders(<UserMenu user={onboardedUser} />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    expect(postLogout).toHaveBeenCalledOnce()
  })
})
