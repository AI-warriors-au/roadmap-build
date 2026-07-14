import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockUser } from '@/contexts/AuthContext'
import { getHealth, getMe } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import App from './App'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getHealth: vi.fn(),
    getMe: vi.fn(),
    postLogout: vi.fn(),
  }
})

const onboardedUser = createMockUser()
const notOnboardedUser = createMockUser({ onboardedAt: null })

function unauthorizedError() {
  return Object.assign(new Error('Unauthorized'), {
    isAxiosError: true,
    response: { status: 401 },
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockReset()
    vi.mocked(getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
    })
    vi.mocked(getMe).mockReset()
    vi.mocked(getMe).mockRejectedValue(unauthorizedError())
  })

  it('redirects unauthenticated visitors from / to the login page', async () => {
    renderWithProviders(<App />, { route: '/' })

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Learnmap' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
  })

  it('redirects unauthenticated visitors from /dashboard to the login page', async () => {
    renderWithProviders(<App />, { route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Learnmap' }),
    ).toBeInTheDocument()
  })

  it('redirects not-yet-onboarded users from /dashboard to onboarding', async () => {
    vi.mocked(getMe).mockResolvedValue(notOnboardedUser)

    renderWithProviders(<App />, {
      route: '/dashboard',
      authUser: notOnboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Learnmap' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Display name')).toBeInTheDocument()
  })

  it('opens the dashboard for onboarded users and redirects / into the shell', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('shows the health widget on the dashboard', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    expect(
      screen.getByRole('region', { name: 'API health' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
  })

  it('renders dashboard inside AppShell with active nav state', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('renders browse inside AppShell with active nav state', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/browse',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Browse Roadmaps' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse Roadmaps' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('does not unmount the shell when navigating between shell routes', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)
    const user = userEvent.setup()

    renderWithProviders(<App />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Browse Roadmaps' }))

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBe(nav)
    expect(
      screen.getByRole('heading', { name: 'Browse Roadmaps' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
  })

  it('renders the 404 page inside the shell for unknown routes', async () => {
    vi.mocked(getMe).mockResolvedValue(onboardedUser)

    renderWithProviders(<App />, {
      route: '/does-not-exist',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: "This path doesn't exist" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to dashboard' }),
    ).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('shows a loading state while session is being checked', () => {
    renderWithProviders(<App />, {
      route: '/dashboard',
      authLoading: true,
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking sign-in status…',
    )
    expect(
      screen.queryByRole('heading', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
  })
})
