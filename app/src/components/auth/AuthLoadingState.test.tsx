import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { AuthLoadingState } from './AuthLoadingState'

describe('AuthLoadingState', () => {
  it('announces that sign-in status is being checked', () => {
    renderWithProviders(<AuthLoadingState />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking sign-in status…',
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
