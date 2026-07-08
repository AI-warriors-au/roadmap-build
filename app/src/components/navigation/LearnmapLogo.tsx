import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { BrandIcon } from './BrandIcon'

type LearnmapLogoProps = {
  className?: string
}

export function LearnmapLogo({ className }: LearnmapLogoProps) {
  return (
    <Link
      to="/dashboard"
      aria-label="Learnmap, go to dashboard"
      className={cn(
        'inline-flex min-h-11 min-w-[120px] shrink-0 items-center gap-2 rounded-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <BrandIcon size={24} />
      <span className="text-foreground text-base font-bold tracking-tight">
        Learnmap
      </span>
    </Link>
  )
}
