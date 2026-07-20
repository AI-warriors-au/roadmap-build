import { useMemo, useState } from 'react'

import { CatalogEmptyState } from '@/components/catalog/CatalogEmptyState'
import { CatalogSearch } from '@/components/catalog/CatalogSearch'
import {
  collectUniqueTags,
  splitCatalogFilterTags,
} from '@/components/catalog/catalogFilterTags'
import { RoadmapCard } from '@/components/catalog/RoadmapCard'
import { TagFilterPills } from '@/components/catalog/TagFilterPills'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useRoadmaps } from '@/hooks/useRoadmaps'

const SEARCH_DEBOUNCE_MS = 300

export function BrowsePage() {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)

  // Unfiltered fetch for header count + tag census; filtered fetch drives the grid.
  const catalogQuery = useRoadmaps()
  const resultsQuery = useRoadmaps({
    search: debouncedSearch,
    tags: selectedTags,
  })

  const { primary, overflow } = useMemo(() => {
    const catalogTags = collectUniqueTags(catalogQuery.data?.items ?? [])
    return splitCatalogFilterTags(catalogTags)
  }, [catalogQuery.data?.items])

  const totalCount = catalogQuery.data?.items.length
  const items = resultsQuery.data?.items ?? []
  // Do not gate on isFetching — cached empty + background refetch would blank the catalog.
  const showEmpty = resultsQuery.isSuccess && items.length === 0

  function toggleTag(slug: string) {
    setSelectedTags((current) =>
      current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug],
    )
  }

  function clearTags() {
    setSelectedTags([])
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-background px-8 pt-10 pb-6">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-primary text-[11px] font-semibold tracking-widest uppercase">
            Library
          </p>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight">
            Browse Roadmaps
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {totalCount === undefined
              ? 'Pick a path and start learning.'
              : `Pick a path and start learning — ${totalCount} roadmaps and counting.`}
          </p>
        </div>
      </header>

      <div className="border-border bg-background sticky top-14 z-10 border-b px-8 py-4">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center">
          <CatalogSearch value={search} onChange={setSearch} />
          <TagFilterPills
            primaryTags={primary}
            overflowTags={overflow}
            selectedSlugs={selectedTags}
            onToggle={toggleTag}
            onClear={clearTags}
          />
        </div>
      </div>

      <section className="bg-secondary flex-1 px-8 pt-7 pb-16">
        <div className="mx-auto max-w-[1200px]">
          {resultsQuery.isPending && (
            <p className="text-muted-foreground text-sm" role="status">
              Loading roadmaps…
            </p>
          )}

          {resultsQuery.isError && (
            <p className="text-destructive text-sm" role="alert">
              {`Could not load roadmaps${
                resultsQuery.error instanceof Error
                  ? `: ${resultsQuery.error.message}`
                  : ''
              }`}
            </p>
          )}

          {showEmpty && <CatalogEmptyState />}

          {items.length > 0 && (
            <ul
              className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3"
              aria-label="Roadmap catalog"
            >
              {items.map((roadmap) => (
                <li key={roadmap.id}>
                  <RoadmapCard roadmap={roadmap} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
