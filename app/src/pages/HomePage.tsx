import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Learnmap</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Frontend scaffold is ready. Build features from here.
      </p>
      <Button type="button">Get started</Button>
    </main>
  )
}
