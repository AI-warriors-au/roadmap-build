import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMe } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { LoginPage } from './LoginPage'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getMe: vi.fn(),
  }
})

function unauthorizedError() {
  return Object.assign(new Error('Unauthorized'), {
    isAxiosError: true,
    response: { status: 401 },
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
  })

  it('shows a loading state while auth status is unresolved', () => {
    vi.mocked(getMe).mockImplementation(() => new Promise(() => undefined))

    renderWithProviders(<LoginPage />, { route: '/login' })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking sign-in status…',
    )
    expect(
      screen.queryByRole('button', { name: /Continue with GitHub/i }),
    ).not.toBeInTheDocument()
  })

  it('renders Learnmap branding and the GitHub sign-in button when logged out', async () => {
    vi.mocked(getMe).mockRejectedValue(unauthorizedError())

    renderWithProviders(<LoginPage />, { route: '/login' })

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Learnmap' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Learnmap' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Continue with GitHub' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('GitHub is the only sign-in method for now.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Secure OAuth — we never see your GitHub password.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '#terms',
    )
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '#privacy')
  })

  it('navigates to the GitHub OAuth endpoint and shows a loading state', async () => {
    vi.mocked(getMe).mockRejectedValue(unauthorizedError())
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })

    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { route: '/login' })

    const button = await screen.findByRole('button', {
      name: 'Continue with GitHub',
    })
    await user.click(button)

    expect(assign).toHaveBeenCalledWith('/api/auth/github')
    expect(
      screen.getByRole('button', { name: 'Connecting to GitHub…' }),
    ).toBeDisabled()

    vi.unstubAllGlobals()
  })

  it('activates GitHub sign-in with the keyboard', async () => {
    vi.mocked(getMe).mockRejectedValue(unauthorizedError())
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign })

    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { route: '/login' })

    const button = await screen.findByRole('button', {
      name: 'Continue with GitHub',
    })
    button.focus()
    await user.keyboard('{Enter}')

    expect(assign).toHaveBeenCalledWith('/api/auth/github')

    vi.unstubAllGlobals()
  })

  it('redirects authenticated users to the dashboard', async () => {
    vi.mocked(getMe).mockResolvedValue({
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    })

    renderWithProviders(<LoginPage />, { route: '/login' })

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Welcome to Learnmap' }),
      ).not.toBeInTheDocument()
    })
  })
})
