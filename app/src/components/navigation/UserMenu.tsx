import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/hooks/useLogout'
import type { MeResponse } from '@/lib/api'
import { getInitials } from '@/lib/profile'

type UserMenuProps = {
  user: MeResponse
}

export function UserMenu({ user }: UserMenuProps) {
  const logoutMutation = useLogout()
  const initials = getInitials(user.displayName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex items-center gap-1 rounded-full"
      >
        <Avatar>
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <ChevronDown
          className="text-muted-foreground size-4"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>
          <p className="text-foreground truncate text-sm font-semibold">
            {user.displayName}
          </p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link to="/settings" />}>
          <Settings aria-hidden="true" />
          Profile &amp; Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => {
            logoutMutation.mutate()
          }}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
