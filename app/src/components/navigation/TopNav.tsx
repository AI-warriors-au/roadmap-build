import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { LearnmapLogo } from './LearnmapLogo'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-11 items-center px-3 text-sm transition-colors',
    'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    isActive
      ? 'border-primary text-primary border-b-2 font-semibold'
      : 'text-muted-foreground hover:bg-muted',
  )

export function TopNav() {
  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex h-12 max-w-7xl items-center gap-8 px-8"
      >
        <LearnmapLogo />
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" className={navLinkClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/browse" className={navLinkClassName}>
            Browse Roadmaps
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
