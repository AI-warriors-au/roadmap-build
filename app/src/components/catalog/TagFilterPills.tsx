import { Popover } from '@base-ui/react/popover'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { RoadmapCatalogTag } from '@/lib/api'
import { cn } from '@/lib/utils'

type TagFilterPillsProps = {
  primaryTags: RoadmapCatalogTag[]
  overflowTags?: RoadmapCatalogTag[]
  selectedSlugs: string[]
  onToggle: (slug: string) => void
  onClear: () => void
}

function TagPill({
  tag,
  active,
  onToggle,
}: {
  tag: RoadmapCatalogTag
  active: boolean
  onToggle: (slug: string) => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      className={cn(
        'h-7 rounded-full px-3 text-[13px]',
        active && 'font-semibold',
      )}
      aria-pressed={active}
      onClick={() => {
        onToggle(tag.slug)
      }}
    >
      {tag.name}
    </Button>
  )
}

export function TagFilterPills({
  primaryTags,
  overflowTags = [],
  selectedSlugs,
  onToggle,
  onClear,
}: TagFilterPillsProps) {
  const hasSelection = selectedSlugs.length > 0
  const hasOverflow = overflowTags.length > 0
  const selectedOverflowCount = overflowTags.filter((tag) =>
    selectedSlugs.includes(tag.slug),
  ).length

  const moreLabel =
    selectedOverflowCount > 0
      ? `More · ${selectedOverflowCount}`
      : `+${overflowTags.length} more`

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by tag"
    >
      <Button
        type="button"
        size="sm"
        variant={hasSelection ? 'outline' : 'default'}
        className={cn(
          'h-7 rounded-full px-3 text-[13px]',
          !hasSelection && 'font-semibold',
        )}
        aria-pressed={!hasSelection}
        onClick={onClear}
      >
        All
      </Button>

      {primaryTags.map((tag) => (
        <TagPill
          key={tag.slug}
          tag={tag}
          active={selectedSlugs.includes(tag.slug)}
          onToggle={onToggle}
        />
      ))}

      {hasOverflow && (
        <Popover.Root>
          <Popover.Trigger
            render={
              <Button
                type="button"
                size="sm"
                variant={selectedOverflowCount > 0 ? 'default' : 'ghost'}
                className={cn(
                  'h-7 gap-1 px-2 text-[13px]',
                  selectedOverflowCount === 0 && 'text-muted-foreground',
                  selectedOverflowCount > 0 && 'font-semibold',
                )}
              />
            }
          >
            {moreLabel}
            <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Positioner side="bottom" align="start" sideOffset={8}>
              <Popover.Popup className="bg-popover text-popover-foreground border-border z-[200] w-[min(100vw-2rem,320px)] rounded-lg border p-3 shadow-md outline-none">
                <Popover.Title className="text-foreground text-sm font-semibold">
                  More tags
                </Popover.Title>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Select any — filters use OR matching.
                </p>
                <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto">
                  {overflowTags.map((tag) => {
                    const active = selectedSlugs.includes(tag.slug)
                    return (
                      <Button
                        key={tag.slug}
                        type="button"
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        className={cn(
                          'h-7 rounded-full px-3 text-[13px]',
                          active && 'font-semibold',
                        )}
                        aria-pressed={active}
                        onClick={() => {
                          onToggle(tag.slug)
                        }}
                      >
                        {tag.name}
                      </Button>
                    )
                  })}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}

      {hasSelection && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-muted-foreground h-7 px-2 text-[13px]"
          onClick={onClear}
        >
          Clear
        </Button>
      )}
    </div>
  )
}
