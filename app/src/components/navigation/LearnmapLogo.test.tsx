import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { LearnmapLogo } from './LearnmapLogo'

describe('LearnmapLogo', () => {
  it('renders the Learnmap wordmark and links to /dashboard', () => {
    renderWithProviders(<LearnmapLogo />, { route: '/browse' })

    const logoLink = screen.getByRole('link', {
      name: 'Learnmap, go to dashboard',
    })

    expect(logoLink).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Learnmap')).toBeInTheDocument()
  })

  it('does not set aria-current on the logo link', () => {
    renderWithProviders(<LearnmapLogo />, { route: '/dashboard' })

    expect(
      screen.getByRole('link', { name: 'Learnmap, go to dashboard' }),
    ).not.toHaveAttribute('aria-current')
  })
})
