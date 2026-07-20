import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { CatalogEmptyState } from './CatalogEmptyState'

describe('CatalogEmptyState', () => {
  it('shows empty-state copy', () => {
    renderWithProviders(<CatalogEmptyState />)

    expect(
      screen.getByText('No roadmaps match your filters'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Try a different search term or clear the active tag filters.',
      ),
    ).toBeInTheDocument()
  })
})
