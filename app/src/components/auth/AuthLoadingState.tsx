export function AuthLoadingState() {
  return (
    <div
      className="bg-background flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-muted-foreground text-sm">Checking sign-in status…</p>
    </div>
  )
}
