import { HealthWidget } from '@/components/HealthWidget'

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Your learning overview will appear here.
      </p>
      <div className="mt-6 max-w-md">
        <HealthWidget />
      </div>
    </div>
  )
}
