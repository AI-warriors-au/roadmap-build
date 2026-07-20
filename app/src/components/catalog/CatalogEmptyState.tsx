export function CatalogEmptyState() {
  return (
    <div
      className="border-border bg-card flex flex-col items-center justify-center rounded-[10px] border border-dashed px-6 py-16 text-center"
      role="status"
    >
      <p className="text-foreground text-base font-semibold">
        No roadmaps match your filters
      </p>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Try a different search term or clear the active tag filters.
      </p>
    </div>
  )
}
