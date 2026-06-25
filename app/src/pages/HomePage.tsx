import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getHealth } from '@/lib/api'
import { cn } from '@/lib/utils'

function formatHealthLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function HomePage() {
  const { data, isPending, isError, isFetching, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Learnmap</h1>

      {isPending && (
        <p className="text-muted-foreground">Checking API health…</p>
      )}

      {isError && (
        <p className="text-destructive" role="alert">
          {`Could not reach the API${error instanceof Error ? `: ${error.message}` : ''}`}
        </p>
      )}

      {data && (
        <dl className="border-border bg-card text-card-foreground grid min-w-64 gap-3 rounded-lg border p-6 text-sm">
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

      <Button
        type="button"
        variant="outline"
        disabled={isFetching}
        onClick={() => {
          void refetch()
        }}
      >
        <RefreshCw className={cn(isFetching && 'animate-spin')} />
        {isFetching ? 'Refreshing…' : 'Refresh health'}
      </Button>
    </main>
  )
}
