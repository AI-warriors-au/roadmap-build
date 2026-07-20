import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { TagFilterPills } from './TagFilterPills'

const primaryTags = [
  { slug: 'frontend', name: 'Frontend' },
  { slug: 'backend', name: 'Backend' },
]

const overflowTags = [
  { slug: 'vue', name: 'Vue' },
  { slug: 'kubernetes', name: 'Kubernetes' },
]

describe('TagFilterPills', () => {
  it('marks All as pressed when no tags are selected', () => {
    renderWithProviders(
      <TagFilterPills
        primaryTags={primaryTags}
        selectedSlugs={[]}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('supports multi-select and shows Clear when tags are active', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onClear = vi.fn()

    renderWithProviders(
      <TagFilterPills
        primaryTags={primaryTags}
        selectedSlugs={['frontend']}
        onToggle={onToggle}
        onClear={onClear}
      />,
    )

    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await user.click(screen.getByRole('button', { name: 'Backend' }))
    expect(onToggle).toHaveBeenCalledWith('backend')

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalled()
  })

  it('keeps overflow tags in a popover instead of expanding the toolbar', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    renderWithProviders(
      <TagFilterPills
        primaryTags={primaryTags}
        overflowTags={overflowTags}
        selectedSlugs={[]}
        onToggle={onToggle}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Frontend' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Vue' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /\+2 more/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /\+2 more/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('More tags')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Vue' })).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Kubernetes' }),
    ).toBeInTheDocument()

    // Primary row stays free of overflow pills.
    const filterGroup = screen.getByRole('group', { name: 'Filter by tag' })
    expect(
      within(filterGroup).queryByRole('button', { name: 'Vue' }),
    ).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Vue' }))
    expect(onToggle).toHaveBeenCalledWith('vue')
  })

  it('shows overflow selection count on the More trigger', () => {
    renderWithProviders(
      <TagFilterPills
        primaryTags={primaryTags}
        overflowTags={overflowTags}
        selectedSlugs={['vue']}
        onToggle={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: /More · 1/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Vue' })).not.toBeInTheDocument()
  })
})
