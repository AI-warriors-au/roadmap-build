import { screen, waitFor } from '@testing-library/react'
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

  it('renders the home page with API health at /', async () => {
    vi.mocked(getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
    })

    renderWithProviders(<App />, { route: '/' })

    expect(
      screen.getByRole('heading', { name: 'Learnmap' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })
})
