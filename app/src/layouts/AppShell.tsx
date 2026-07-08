import { Outlet } from 'react-router-dom'

import { TopNav } from '@/components/navigation/TopNav'

export function AppShell() {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
