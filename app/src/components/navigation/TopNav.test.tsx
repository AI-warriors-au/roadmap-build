import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMe, logout, type MeResponse } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { TopNav } from './TopNav'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getMe: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }
})

const authedUser: MeResponse = {
  id: 'user-1',
  email: 'sam@example.com',
  displayName: 'Sam Rivers',
  avatarUrl: null,
  onboardedAt: null,
}

function mockLoggedOut() {
  vi.mocked(getMe).mockRejectedValue({
    isAxiosError: true,
    response: { status: 401 },
  })
}

function mockAuthenticated() {
  vi.mocked(getMe).mockResolvedValue(authedUser)
}

function mockLoading() {
  vi.mocked(getMe).mockReturnValue(new Promise<MeResponse>(() => {}))
}

describe('TopNav', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(logout).mockReset()
    mockLoggedOut()
  })

  describe('primary navigation', () => {
    it('exposes a primary navigation landmark', async () => {
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      expect(
        screen.getByRole('navigation', { name: 'Primary' }),
      ).toBeInTheDocument()
      await screen.findByRole('link', { name: 'Log in' })
    })

    it('renders Dashboard and Browse Roadmaps links', async () => {
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/dashboard',
      )
      expect(
        screen.getByRole('link', { name: 'Browse Roadmaps' }),
      ).toHaveAttribute('href', '/browse')
      await screen.findByRole('link', { name: 'Log in' })
    })

    it('marks Dashboard as the current page on /dashboard', async () => {
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(
        screen.getByRole('link', { name: 'Browse Roadmaps' }),
      ).not.toHaveAttribute('aria-current')
      await screen.findByRole('link', { name: 'Log in' })
    })

    it('marks Browse Roadmaps as the current page on /browse', async () => {
      renderWithProviders(<TopNav />, { route: '/browse' })

      expect(
        screen.getByRole('link', { name: 'Browse Roadmaps' }),
      ).toHaveAttribute('aria-current', 'page')
      await screen.findByRole('link', { name: 'Log in' })
    })
  })

  describe('auth-aware right region', () => {
    // FR-8: unauthenticated visitors see Log in / Sign up
    it('shows Log in and Sign up when logged out', async () => {
      mockLoggedOut()
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      expect(await screen.findByRole('link', { name: 'Log in' })).toHaveAttribute(
        'href',
        '/login',
      )
      expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
        'href',
        '/login',
      )
      expect(
        screen.queryByRole('button', { name: 'Open user menu' }),
      ).not.toBeInTheDocument()
    })

    // FR-1: authenticated users see the UserMenu instead of Log in / Sign up
    it('shows the UserMenu when authenticated', async () => {
      mockAuthenticated()
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      expect(
        await screen.findByRole('button', { name: 'Open user menu' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Log in' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'Sign up' }),
      ).not.toBeInTheDocument()
    })

    // FR-8: neither state flickers during the initial pending fetch
    it('shows neither auth state while the session is loading', () => {
      mockLoading()
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      expect(
        screen.queryByRole('link', { name: 'Log in' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Open user menu' }),
      ).not.toBeInTheDocument()
    })

    // FR-5/6: after signing out the nav reverts to logged-out without a manual refresh
    it('reverts to the logged-out nav after signing out', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 })
      mockAuthenticated()
      vi.mocked(logout).mockResolvedValue(undefined)
      renderWithProviders(<TopNav />, { route: '/dashboard' })

      await user.click(
        await screen.findByRole('button', { name: 'Open user menu' }),
      )

      // Session is cleared server-side once logout resolves.
      mockLoggedOut()
      await user.click(await screen.findByRole('menuitem', { name: /Sign out/ }))

      expect(
        await screen.findByRole('link', { name: 'Log in' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Open user menu' }),
      ).not.toBeInTheDocument()
    })
  })
})
