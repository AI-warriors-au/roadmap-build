import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getHealth, getMe } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import App from './App'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getHealth: vi.fn(),
    getMe: vi.fn(),
  }
})

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockReset()
    vi.mocked(getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
    })
    vi.mocked(getMe).mockReset()
    vi.mocked(getMe).mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    })
  })

  it('opens the dashboard by default and redirects / into the shell', async () => {
    renderWithProviders(<App />, { route: '/' })

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
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
    renderWithProviders(<App />, { route: '/dashboard' })

    expect(
      screen.getByRole('region', { name: 'API health' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
  })

  it('renders dashboard inside AppShell with active nav state', () => {
    renderWithProviders(<App />, { route: '/dashboard' })

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('renders browse inside AppShell with active nav state', () => {
    renderWithProviders(<App />, { route: '/browse' })

    expect(
      screen.getByRole('heading', { name: 'Browse Roadmaps' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse Roadmaps' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('does not unmount the shell when navigating between shell routes', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />, { route: '/dashboard' })

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Browse Roadmaps' }))

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBe(nav)
    expect(
      screen.getByRole('heading', { name: 'Browse Roadmaps' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
  })

  it('renders the 404 page inside the shell for unknown routes', () => {
    renderWithProviders(<App />, { route: '/does-not-exist' })

    expect(
      screen.getByRole('heading', { name: "This path doesn't exist" }),
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

  it('renders the login page when using an auth action', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />, { route: '/dashboard' })

    await user.click(await screen.findByRole('link', { name: 'Log in' }))

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Learnmap' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
  })
})
