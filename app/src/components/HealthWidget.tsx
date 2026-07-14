import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getHealth } from '@/lib/api'
import { cn } from '@/lib/utils'

function formatHealthLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function HealthWidget() {
  const { data, isPending, isError, isFetching, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <section
      aria-label="API health"
      className="border-border bg-card text-card-foreground flex flex-col gap-4 rounded-lg border p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-foreground text-sm font-semibold">API health</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFetching}
          onClick={() => {
            void refetch()
          }}
        >
          <RefreshCw className={cn(isFetching && 'animate-spin')} />
          {isFetching ? 'Refreshing…' : 'Refresh health'}
        </Button>
      </div>

      {isPending && (
        <p className="text-muted-foreground text-sm">Checking API health…</p>
      )}

      {isError && (
        <p className="text-destructive text-sm" role="alert">
          {`Could not reach the API${error instanceof Error ? `: ${error.message}` : ''}`}
        </p>
      )}

      {data && (
        <dl className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd
              className={
                data.status === 'ok'
                  ? 'font-medium text-green-600'
                  : 'text-destructive font-medium'
              }
            >
              {formatHealthLabel(data.status)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Database</dt>
            <dd
              className={
                data.database === 'connected'
                  ? 'font-medium text-green-600'
                  : 'text-destructive font-medium'
              }
            >
              {formatHealthLabel(data.database)}
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
