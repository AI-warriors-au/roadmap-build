import { Link, NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { LearnmapLogo } from './LearnmapLogo'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-full items-center px-3.5 text-sm transition-colors',
    'border-t-2 border-b-2',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    isActive
      ? 'border-b-primary text-primary border-t-transparent font-semibold'
      : 'text-muted-foreground hover:text-foreground border-transparent font-normal',
  )

export function TopNav() {
  return (
    <header className="bg-background sticky top-0 z-[100] border-b">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center px-8">
        <LearnmapLogo className="mr-9 shrink-0" />
        <nav
          aria-label="Primary"
          className="flex h-full items-stretch"
        >
          <NavLink to="/dashboard" className={navLinkClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/browse" className={navLinkClassName}>
            Browse Roadmaps
          </NavLink>
        </nav>
        <div className="flex-1" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            to="/login"
            className="bg-primary text-primary-foreground hover:bg-[#6d28d9] inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold tracking-tight transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}
