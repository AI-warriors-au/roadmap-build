import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

type CatalogSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  return (
    <div className="relative w-full max-w-[420px]">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder="Search roadmaps…"
        aria-label="Search roadmaps"
        className="pl-9"
      />
    </div>
  )
}
