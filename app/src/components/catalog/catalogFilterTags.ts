import type { RoadmapCatalogTag } from '@/lib/api'

/**
 * Primary filter pills shown by default (design/mockups/roadmap-catalog.md).
 * Remaining catalog tags appear behind “+N more”.
 */
export const CATALOG_PRIMARY_FILTER_TAGS: RoadmapCatalogTag[] = [
  { slug: 'frontend', name: 'Frontend' },
  { slug: 'backend', name: 'Backend' },
  { slug: 'devops', name: 'DevOps' },
  { slug: 'react', name: 'React' },
  { slug: 'python', name: 'Python' },
]

function titleCaseTagName(name: string): string {
  if (/[A-Z]/.test(name)) {
    return name
  }
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function collectUniqueTags(
  items: { tags: RoadmapCatalogTag[] }[],
): RoadmapCatalogTag[] {
  const bySlug = new Map<string, RoadmapCatalogTag>()
  for (const item of items) {
    for (const tag of item.tags) {
      if (!bySlug.has(tag.slug)) {
        bySlug.set(tag.slug, {
          slug: tag.slug,
          name: titleCaseTagName(tag.name),
        })
      }
    }
  }
  return [...bySlug.values()]
}

export function splitCatalogFilterTags(catalogTags: RoadmapCatalogTag[]): {
  primary: RoadmapCatalogTag[]
  overflow: RoadmapCatalogTag[]
} {
  const primarySlugs = new Set(
    CATALOG_PRIMARY_FILTER_TAGS.map((tag) => tag.slug),
  )

  const overflow = catalogTags
    .filter((tag) => !primarySlugs.has(tag.slug))
    .sort((a, b) => a.name.localeCompare(b.name))

  return { primary: CATALOG_PRIMARY_FILTER_TAGS, overflow }
}
