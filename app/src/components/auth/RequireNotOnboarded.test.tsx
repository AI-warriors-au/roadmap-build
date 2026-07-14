import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { createMockUser } from '@/contexts/AuthContext'
import { renderWithProviders } from '@/test/test-utils'

import { RequireNotOnboarded } from './RequireNotOnboarded'

function OnboardingRoutes() {
  return (
    <Routes>
      <Route element={<RequireNotOnboarded />}>
        <Route path="/onboarding" element={<h1>Onboarding form</h1>} />
      </Route>
      <Route path="/dashboard" element={<h1>Dashboard</h1>} />
    </Routes>
  )
}

describe('RequireNotOnboarded', () => {
  it('shows a loading state while the session is unresolved', () => {
    renderWithProviders(<OnboardingRoutes />, {
      route: '/onboarding',
      authLoading: true,
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking sign-in status…',
    )
    expect(
      screen.queryByRole('heading', { name: 'Onboarding form' }),
    ).not.toBeInTheDocument()
  })

  it('redirects onboarded users to the dashboard', async () => {
    const onboardedUser = createMockUser()

    renderWithProviders(<OnboardingRoutes />, {
      route: '/onboarding',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Onboarding form' }),
    ).not.toBeInTheDocument()
  })

  it('renders onboarding for authenticated users who have not onboarded', async () => {
    const notOnboardedUser = createMockUser({ onboardedAt: null })

    renderWithProviders(<OnboardingRoutes />, {
      route: '/onboarding',
      authUser: notOnboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Onboarding form' }),
    ).toBeInTheDocument()
  })
})
