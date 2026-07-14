import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { createMockUser } from '@/contexts/AuthContext'
import { renderWithProviders } from '@/test/test-utils'

import { RequireAuth } from './RequireAuth'

function ProtectedRoutes() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/protected" element={<h1>Protected area</h1>} />
      </Route>
      <Route path="/login" element={<h1>Login page</h1>} />
    </Routes>
  )
}

describe('RequireAuth', () => {
  it('shows a loading state while the session is unresolved', () => {
    renderWithProviders(<ProtectedRoutes />, {
      route: '/protected',
      authLoading: true,
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking sign-in status…',
    )
    expect(
      screen.queryByRole('heading', { name: 'Protected area' }),
    ).not.toBeInTheDocument()
  })

  it('redirects unauthenticated visitors to login', async () => {
    renderWithProviders(<ProtectedRoutes />, { route: '/protected' })

    expect(
      await screen.findByRole('heading', { name: 'Login page' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Protected area' }),
    ).not.toBeInTheDocument()
  })

  it('renders child routes for authenticated users', async () => {
    const user = createMockUser()

    renderWithProviders(<ProtectedRoutes />, {
      route: '/protected',
      authUser: user,
    })

    expect(
      await screen.findByRole('heading', { name: 'Protected area' }),
    ).toBeInTheDocument()
  })
})
