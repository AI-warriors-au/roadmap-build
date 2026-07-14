import { MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[520px] flex-col items-center justify-center px-6 py-24 text-center">
      <MapPinOff
        className="text-muted-foreground/40 mb-2 size-12"
        aria-hidden="true"
      />
      <p className="text-primary text-6xl font-extrabold tracking-tighter">404</p>
      <h1 className="text-foreground mt-5 text-3xl font-bold tracking-tight">
        This path doesn&apos;t exist
      </h1>
      <p className="text-muted-foreground mt-3 max-w-[380px] text-base leading-relaxed">
        The page you&apos;re looking for may have moved or never existed. Let&apos;s
        get you back on track.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/dashboard"
          className="bg-primary text-primary-foreground hover:bg-[#6d28d9] inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold tracking-tight transition-colors"
        >
          Back to dashboard
        </Link>
        <Link
          to="/browse"
          className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center rounded-full border px-6 py-2.5 text-sm font-semibold tracking-tight transition-colors"
        >
          Browse roadmaps
        </Link>
      </div>
    </div>
  )
}
