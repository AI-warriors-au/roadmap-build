import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMe, updateProfile, type MeResponse } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { SettingsPage } from './SettingsPage'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getMe: vi.fn(),
    updateProfile: vi.fn(),
  }
})

const currentUser: MeResponse = {
  id: 'user-1',
  email: 'sam@example.com',
  displayName: 'Sam Rivers',
  avatarUrl: null,
  onboardedAt: null,
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(updateProfile).mockReset()
    vi.mocked(getMe).mockResolvedValue(currentUser)
  })

  // AC: page renders the profile (display name editable; email + avatar read-only)
  it('renders the profile with an editable name and read-only email', async () => {
    renderWithProviders(<SettingsPage />, { route: '/settings' })

    const nameInput = await screen.findByRole('textbox', {
      name: 'Display name',
    })
    expect(nameInput).toHaveValue('Sam Rivers')
    expect(nameInput).not.toHaveAttribute('readonly')

    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toHaveValue('sam@example.com')
    expect(emailInput).toHaveAttribute('readonly')
  })

  // AC: edit display name, save, and see the change reflected (same hook the nav uses)
  it('saves an edited display name and reflects the update', async () => {
    const user = userEvent.setup()
    const updated: MeResponse = { ...currentUser, displayName: 'Sam R.' }
    vi.mocked(updateProfile).mockResolvedValue(updated)

    renderWithProviders(<SettingsPage />, { route: '/settings' })

    const nameInput = await screen.findByRole('textbox', {
      name: 'Display name',
    })
    await user.clear(nameInput)
    await user.type(nameInput, 'Sam R.')

    // The refetch triggered by cache invalidation returns the updated user.
    vi.mocked(getMe).mockResolvedValue(updated)

    await user.click(screen.getByRole('button', { name: /Save changes/ }))

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        { displayName: 'Sam R.' },
        expect.anything(),
      )
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Profile updated.',
    )
  })

  // AC: invalid input is rejected client-side with a clear error
  it('shows a validation error and does not call the API for an empty name', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsPage />, { route: '/settings' })

    const nameInput = await screen.findByRole('textbox', {
      name: 'Display name',
    })
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /Save changes/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Display name is required.',
    )
    expect(updateProfile).not.toHaveBeenCalled()
  })

  // FR-12: request-level error is surfaced and the control is not stuck
  it('surfaces a request error when the save fails', async () => {
    const user = userEvent.setup()
    vi.mocked(updateProfile).mockRejectedValue(new Error('boom'))

    renderWithProviders(<SettingsPage />, { route: '/settings' })

    const nameInput = await screen.findByRole('textbox', {
      name: 'Display name',
    })
    await user.clear(nameInput)
    await user.type(nameInput, 'New Name')
    await user.click(screen.getByRole('button', { name: /Save changes/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn.t save your changes/i,
    )
    expect(
      screen.getByRole('button', { name: /Save changes/ }),
    ).toBeEnabled()
  })

  // Cancel discards the edit
  it('resets the field when cancelled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsPage />, { route: '/settings' })

    const nameInput = await screen.findByRole('textbox', {
      name: 'Display name',
    })
    await user.clear(nameInput)
    await user.type(nameInput, 'Temporary')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(nameInput).toHaveValue('Sam Rivers')
  })
})
