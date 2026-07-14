import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { createMockUser } from '@/contexts/AuthContext'
import { renderWithProviders } from '@/test/test-utils'

import { RequireOnboarded } from './RequireOnboarded'

function OnboardedRoutes() {
  return (
    <Routes>
      <Route element={<RequireOnboarded />}>
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
      </Route>
      <Route path="/onboarding" element={<h1>Onboarding</h1>} />
    </Routes>
  )
}

describe('RequireOnboarded', () => {
  it('shows a loading state while the session is unresolved', () => {
    renderWithProviders(<OnboardedRoutes />, {
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

  it('redirects users who have not onboarded to onboarding', async () => {
    const notOnboardedUser = createMockUser({ onboardedAt: null })

    renderWithProviders(<OnboardedRoutes />, {
      route: '/dashboard',
      authUser: notOnboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Onboarding' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()
  })

  it('renders child routes for onboarded users', async () => {
    const onboardedUser = createMockUser()

    renderWithProviders(<OnboardedRoutes />, {
      route: '/dashboard',
      authUser: onboardedUser,
    })

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })
})
