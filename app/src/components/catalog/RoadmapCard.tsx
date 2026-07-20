import { Badge } from '@/components/ui/badge'
import type { RoadmapCatalogItem } from '@/lib/api'

type RoadmapCardProps = {
  roadmap: RoadmapCatalogItem
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const topicLabel =
    roadmap.topicCount === 1 ? '1 topic' : `${roadmap.topicCount} topics`

  return (
    <article
      className="border-border bg-card relative flex flex-col gap-3 overflow-hidden rounded-[10px] border p-5 shadow-sm"
      aria-label={roadmap.title}
    >
      <div
        className="bg-primary absolute inset-x-0 top-0 h-1"
        aria-hidden="true"
      />

      {roadmap.isEnrolled && (
        <Badge variant="info" className="w-fit">
          In progress
        </Badge>
      )}

      <h3 className="text-foreground text-base font-semibold tracking-tight">
        {roadmap.title}
      </h3>

      {roadmap.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {roadmap.tags.map((tag) => (
            <li key={tag.slug}>
              <Badge variant="brand">{tag.name}</Badge>
            </li>
          ))}
        </ul>
      )}

      {roadmap.description && (
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {roadmap.description}
        </p>
      )}

      <footer className="mt-auto pt-1">
        <p className="text-muted-foreground/80 text-sm">{topicLabel}</p>
      </footer>
    </article>
  )
}
