import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { SettingsPage } from './SettingsPage'

describe('SettingsPage', () => {
  it('renders the profile and settings placeholder', () => {
    renderWithProviders(<SettingsPage />, { route: '/settings' })

    expect(
      screen.getByRole('heading', { name: 'Profile & Settings' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Profile and account settings are coming soon/i),
    ).toBeInTheDocument()
  })
})
