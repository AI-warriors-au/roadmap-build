import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createMockUser } from '@/contexts/AuthContext'
import { renderWithProviders } from '@/test/test-utils'

import { TopNav } from './TopNav'

const onboardedUser = createMockUser()

describe('TopNav', () => {
  it('exposes a primary navigation landmark', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
  })

  it('renders Dashboard and Browse Roadmaps links', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
    expect(
      screen.getByRole('link', { name: 'Browse Roadmaps' }),
    ).toHaveAttribute('href', '/browse')
  })

  it('marks Dashboard as the current page on /dashboard', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('link', { name: 'Browse Roadmaps' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('marks Browse Roadmaps as the current page on /browse', () => {
    renderWithProviders(<TopNav />, { route: '/browse' })

    expect(
      screen.getByRole('link', { name: 'Browse Roadmaps' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('applies active styling classes to the current nav link', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboardLink.className).toMatch(/border-b-primary/)
    expect(dashboardLink.className).toMatch(/font-semibold/)
  })

  it('keeps inactive links keyboard-focusable with focus ring utilities', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    const browseLink = screen.getByRole('link', { name: 'Browse Roadmaps' })
    expect(browseLink.className).toMatch(/focus-visible:ring-2/)
    expect(browseLink).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('renders Log in and Sign up auth actions when logged out', async () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    expect(await screen.findByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('does not flash logged-out actions while auth is loading', () => {
    renderWithProviders(<TopNav />, {
      route: '/dashboard',
      authLoading: true,
    })

    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Open user menu' }),
    ).not.toBeInTheDocument()
  })

  it('renders the user menu trigger when authenticated', () => {
    renderWithProviders(<TopNav />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    expect(
      screen.getByRole('button', { name: 'Open user menu' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
  })

  it('uses text colour hover on inactive links instead of background fill', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    const browseLink = screen.getByRole('link', { name: 'Browse Roadmaps' })
    expect(browseLink.className).toMatch(/hover:text-foreground/)
    expect(browseLink.className).not.toMatch(/hover:bg-muted/)
  })
})
