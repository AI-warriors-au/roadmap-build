import { useQuery } from '@tanstack/react-query'

import { getRoadmaps, type ListRoadmapsResponse } from '@/lib/api'

export type UseRoadmapsParams = {
  search?: string
  tags?: string[]
}

export function roadmapsQueryKey(params: UseRoadmapsParams = {}) {
  const search = params.search?.trim() ?? ''
  const tags = [...(params.tags ?? [])].sort()
  return ['roadmaps', { search, tags }] as const
}

export function useRoadmaps(params: UseRoadmapsParams = {}) {
  const search = params.search?.trim() ?? ''
  const tags = params.tags ?? []

  return useQuery<ListRoadmapsResponse>({
    queryKey: roadmapsQueryKey({ search, tags }),
    queryFn: () =>
      getRoadmaps({
        search: search || undefined,
        tags: tags.length > 0 ? tags : undefined,
      }),
  })
}
