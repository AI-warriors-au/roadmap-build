import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getHealth } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import App from './App'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getHealth: vi.fn(),
  }
})

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockReset()
  })

  it('renders the home page with API health at / outside the shell', async () => {
    vi.mocked(getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
    })

    renderWithProviders(<App />, { route: '/' })

    expect(
      screen.getByRole('heading', { name: 'roadmap-build' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Primary' }),
    ).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
    expect(screen.getByText('Connected')).toBeInTheDocument()
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

  it('renders the login page when using an auth action', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />, { route: '/dashboard' })

    await user.click(screen.getByRole('link', { name: 'Log in' }))

    expect(
      screen.getByRole('heading', { name: 'Log in or sign up' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
  })
})
