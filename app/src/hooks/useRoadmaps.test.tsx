import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRoadmaps } from '@/lib/api'

import { roadmapsQueryKey, useRoadmaps } from './useRoadmaps'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getRoadmaps: vi.fn(),
  }
})

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useRoadmaps', () => {
  beforeEach(() => {
    vi.mocked(getRoadmaps).mockReset()
  })

  it('builds a stable query key from search and sorted tags', () => {
    expect(roadmapsQueryKey({ search: ' React ', tags: ['b', 'a'] })).toEqual([
      'roadmaps',
      { search: 'React', tags: ['a', 'b'] },
    ])
  })

  it('fetches the catalog with the given filters', async () => {
    vi.mocked(getRoadmaps).mockResolvedValue({
      items: [
        {
          id: 'rm-1',
          slug: 'react',
          title: 'React',
          description: null,
          tags: [{ slug: 'react', name: 'React' }],
          topicCount: 5,
          isEnrolled: true,
        },
      ],
    })

    const { result } = renderHook(
      () => useRoadmaps({ search: 'react', tags: ['frontend'] }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getRoadmaps).toHaveBeenCalledWith({
      search: 'react',
      tags: ['frontend'],
    })
    expect(result.current.data?.items).toHaveLength(1)
  })
})
