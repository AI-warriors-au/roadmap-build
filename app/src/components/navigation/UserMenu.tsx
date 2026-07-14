import { Menu } from '@base-ui/react/menu'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useSignOut } from '@/hooks/useSignOut'
import type { MeResponse } from '@/lib/api'
import { cn } from '@/lib/utils'

type UserMenuProps = {
  user: MeResponse
}

function getUserInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

const menuItemClassName =
  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted'

export function UserMenu({ user }: UserMenuProps) {
  const signOut = useSignOut()
  const initials = getUserInitials(user.displayName)

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Open user menu"
        className="hover:bg-muted inline-flex items-center gap-2 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="size-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          >
            {initials}
          </span>
        )}
        <ChevronDown
          className="text-muted-foreground size-3 shrink-0"
          aria-hidden="true"
        />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className="bg-popover text-popover-foreground border-border z-[200] w-[220px] rounded-lg border p-1.5 shadow-md outline-none">
            <div className="px-2.5 py-2">
              <p className="text-foreground text-sm font-semibold">
                {user.displayName}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">{user.email}</p>
            </div>

            <Menu.Separator className="bg-border my-1 h-px" />

            <Menu.LinkItem
              render={<Link to="/settings" />}
              closeOnClick
              className={menuItemClassName}
            >
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              Profile &amp; Settings
            </Menu.LinkItem>

            <Menu.Item
              className={cn(
                menuItemClassName,
                'text-destructive data-[highlighted]:bg-destructive/10',
              )}
              onClick={() => {
                void signOut()
              }}
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
