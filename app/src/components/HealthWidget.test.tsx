import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getHealth } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { HealthWidget } from './HealthWidget'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getHealth: vi.fn(),
  }
})

describe('HealthWidget', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockReset()
  })

  it('shows a loading state while fetching health', () => {
    vi.mocked(getHealth).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<HealthWidget />)

    expect(screen.getByText('Checking API health…')).toBeInTheDocument()
  })

  it('renders API health status when the request succeeds', async () => {
    vi.mocked(getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
    })

    renderWithProviders(<HealthWidget />)

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('renders unhealthy status without treating it as a fetch error', async () => {
    vi.mocked(getHealth).mockResolvedValue({
      status: 'unhealthy',
      database: 'disconnected',
    })

    renderWithProviders(<HealthWidget />)

    await waitFor(() => {
      expect(screen.getByText('Unhealthy')).toBeInTheDocument()
    })
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('shows an error when the API is unreachable', async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error('Network Error'))

    renderWithProviders(<HealthWidget />)

    await waitFor(() => {
      expect(
        screen.getByText('Could not reach the API: Network Error'),
      ).toBeInTheDocument()
    })
  })

  it('refetches health when the refresh button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(getHealth).mockResolvedValue({
      status: 'ok',
      database: 'connected',
    })

    renderWithProviders(<HealthWidget />)

    await waitFor(() => {
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Refresh health' }))

    await waitFor(() => {
      expect(getHealth).toHaveBeenCalledTimes(2)
    })
  })
})
