import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { roadmapsQueryKey } from '@/hooks/useRoadmaps'
import { getRoadmaps, type RoadmapCatalogItem } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { BrowsePage } from './BrowsePage'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getRoadmaps: vi.fn(),
  }
})

const frontend: RoadmapCatalogItem = {
  id: 'rm-1',
  slug: 'frontend-developer',
  title: 'Frontend Developer',
  description: 'UI path',
  tags: [
    { slug: 'frontend', name: 'Frontend' },
    { slug: 'react', name: 'React' },
  ],
  topicCount: 102,
  isEnrolled: true,
}

const backend: RoadmapCatalogItem = {
  id: 'rm-2',
  slug: 'backend-engineer',
  title: 'Backend Engineer',
  description: 'API path',
  tags: [{ slug: 'backend', name: 'Backend' }],
  topicCount: 89,
  isEnrolled: false,
}

const vue: RoadmapCatalogItem = {
  id: 'rm-3',
  slug: 'vue',
  title: 'Vue',
  description: 'Vue path',
  tags: [{ slug: 'vue', name: 'vue' }],
  topicCount: 40,
  isEnrolled: false,
}

describe('BrowsePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(getRoadmaps).mockReset()
    vi.mocked(getRoadmaps).mockImplementation(async (params = {}) => {
      let items = [frontend, backend, vue]
      const search = params.search?.trim().toLowerCase()
      if (search) {
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search),
        )
      }
      if (params.tags && params.tags.length > 0) {
        items = items.filter((item) =>
          item.tags.some((tag) => params.tags!.includes(tag.slug)),
        )
      }
      return { items }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a grid of roadmap cards with catalog fields', async () => {
    renderWithProviders(<BrowsePage />)

    const list = await screen.findByRole('list', { name: 'Roadmap catalog' })
    expect(within(list).getByText('Frontend Developer')).toBeInTheDocument()
    expect(within(list).getByText('Backend Engineer')).toBeInTheDocument()
    expect(within(list).getByText('102 topics')).toBeInTheDocument()
    expect(within(list).getByText('UI path')).toBeInTheDocument()
  })

  it('debounces search by 300ms before refetching', async () => {
    renderWithProviders(<BrowsePage />)
    await screen.findByRole('list', { name: 'Roadmap catalog' })

    const initialCalls = vi.mocked(getRoadmaps).mock.calls.length
    // Single change — avoid userEvent keystroke delays advancing the debounce timer.
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search roadmaps' }), {
      target: { value: 'front' },
    })

    expect(
      vi.mocked(getRoadmaps).mock.calls.slice(initialCalls),
    ).toHaveLength(0)

    await act(async () => {
      vi.advanceTimersByTime(299)
    })
    expect(
      vi.mocked(getRoadmaps).mock.calls.slice(initialCalls),
    ).toHaveLength(0)

    await act(async () => {
      vi.advanceTimersByTime(1)
    })

    await waitFor(() => {
      expect(
        vi.mocked(getRoadmaps).mock.calls.some(
          ([params]) => params?.search === 'front',
        ),
      ).toBe(true)
    })
  })

  it('shows primary filter pills and opens overflow tags in a popover', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    renderWithProviders(<BrowsePage />)
    await screen.findByRole('list', { name: 'Roadmap catalog' })

    const filterGroup = screen.getByRole('group', { name: 'Filter by tag' })
    for (const name of [
      'All',
      'Frontend',
      'Backend',
      'DevOps',
      'React',
      'Python',
    ]) {
      expect(within(filterGroup).getByRole('button', { name })).toBeInTheDocument()
    }
    expect(
      within(filterGroup).queryByRole('button', { name: 'Data' }),
    ).not.toBeInTheDocument()
    expect(
      within(filterGroup).queryByRole('button', { name: 'Vue' }),
    ).not.toBeInTheDocument()

    await user.click(within(filterGroup).getByRole('button', { name: /\+\d+ more/i }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Vue' })).toBeInTheDocument()
    expect(
      within(filterGroup).queryByRole('button', { name: 'Vue' }),
    ).not.toBeInTheDocument()
  })

  it('filters with multi-select OR tag pills and clears selection', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    renderWithProviders(<BrowsePage />)
    await screen.findByRole('list', { name: 'Roadmap catalog' })

    const filterGroup = screen.getByRole('group', { name: 'Filter by tag' })
    await user.click(within(filterGroup).getByRole('button', { name: 'Frontend' }))

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.queryByText('Backend Engineer')).not.toBeInTheDocument()
    })

    await user.click(within(filterGroup).getByRole('button', { name: 'Backend' }))

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
    })

    expect(
      vi.mocked(getRoadmaps).mock.calls.some(
        ([params]) =>
          Array.isArray(params?.tags) &&
          params.tags.includes('frontend') &&
          params.tags.includes('backend'),
      ),
    ).toBe(true)

    await user.click(within(filterGroup).getByRole('button', { name: 'Clear' }))

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
    })
  })

  it('shows an In progress badge for enrolled roadmaps', async () => {
    renderWithProviders(<BrowsePage />)

    const enrolledCard = await screen.findByRole('article', {
      name: 'Frontend Developer',
    })
    expect(within(enrolledCard).getByText('In progress')).toBeInTheDocument()

    const otherCard = screen.getByRole('article', { name: 'Backend Engineer' })
    expect(within(otherCard).queryByText('In progress')).not.toBeInTheDocument()
  })

  it('shows an empty state when no roadmaps match', async () => {
    renderWithProviders(<BrowsePage />)
    await screen.findByRole('list', { name: 'Roadmap catalog' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search roadmaps' }), {
      target: { value: 'zzz-no-match' },
    })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(
      await screen.findByText('No roadmaps match your filters'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('list', { name: 'Roadmap catalog' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the empty state visible while a cached zero-result query refetches', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    })

    queryClient.setQueryData(roadmapsQueryKey(), {
      items: [frontend, backend, vue],
    })
    queryClient.setQueryData(roadmapsQueryKey({ search: 'zzz-no-match' }), {
      items: [],
    })

    // Hang all fetches so a background refetch stays in flight.
    vi.mocked(getRoadmaps).mockImplementation(() => new Promise(() => {}))

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await screen.findByRole('list', { name: 'Roadmap catalog' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search roadmaps' }), {
      target: { value: 'zzz-no-match' },
    })
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    // Cached empty data + background refetch: isSuccess && isFetching.
    // Must not blank the catalog (empty, loading, and grid all hidden).
    expect(
      screen.getByText('No roadmaps match your filters'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading roadmaps…')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('list', { name: 'Roadmap catalog' }),
    ).not.toBeInTheDocument()
  })

  it('shows loading and error states without crashing', async () => {
    vi.mocked(getRoadmaps).mockReturnValue(new Promise(() => {}))

    const { unmount } = renderWithProviders(<BrowsePage />)
    expect(screen.getByText('Loading roadmaps…')).toBeInTheDocument()
    unmount()

    vi.mocked(getRoadmaps).mockRejectedValue(new Error('Network Error'))
    renderWithProviders(<BrowsePage />)

    expect(
      await screen.findByText('Could not load roadmaps: Network Error'),
    ).toBeInTheDocument()
  })
})
