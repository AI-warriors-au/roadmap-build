import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CURRENT_USER_QUERY_KEY,
  useCurrentUser,
} from '@/hooks/useCurrentUser'
import { updateProfile, type MeResponse } from '@/lib/api'
import {
  DISPLAY_NAME_MAX_LENGTH,
  getInitials,
  validateDisplayName,
} from '@/lib/profile'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const queryClient = useQueryClient()

  const displayNameId = useId()
  const emailId = useId()
  const errorId = useId()

  const [displayName, setDisplayName] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName)
    }
  }, [user])

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated: MeResponse) => {
      setDisplayName(updated.displayName)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updated)
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    },
  })

  if (isLoading && !user) {
    return (
      <div
        className="mx-auto max-w-[720px] px-8 py-10"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted-foreground text-sm">Loading your profile…</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-[720px] px-8 py-10">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Profile &amp; Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          You need to be signed in to view your profile.
        </p>
      </div>
    )
  }

  const isDirty = displayName !== user.displayName

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = validateDisplayName(displayName)
    setFieldError(error)
    if (error) {
      return
    }
    mutation.mutate({ displayName: displayName.trim() })
  }

  function handleCancel() {
    setDisplayName(user!.displayName)
    setFieldError(null)
    mutation.reset()
  }

  return (
    <div className="mx-auto max-w-[720px] px-8 py-10">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        Profile &amp; Settings
      </h1>
      <p className="text-muted-foreground mt-2 mb-8 text-sm">
        Manage how you appear across Learnmap.
      </p>

      <div className="border-border bg-card mb-8 flex items-center gap-4 rounded-xl border p-6">
        <Avatar className="size-16 text-lg">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-lg">
            {getInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-foreground text-sm font-semibold">
            {user.displayName}
          </p>
          <p className="text-muted-foreground text-xs">
            Your avatar is managed by your sign-in provider.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="border-border bg-card rounded-xl border p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={displayNameId}
            className="text-foreground text-sm font-medium"
          >
            Display name
          </label>
          <input
            id={displayNameId}
            name="displayName"
            type="text"
            value={displayName}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? errorId : undefined}
            onChange={(event) => {
              setDisplayName(event.target.value)
              if (fieldError) {
                setFieldError(validateDisplayName(event.target.value))
              }
              if (mutation.isSuccess || mutation.isError) {
                mutation.reset()
              }
            }}
            className={cn(
              'border-input bg-background text-foreground h-10 rounded-lg border px-3 text-sm outline-none',
              'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
              fieldError && 'border-destructive',
            )}
          />
          {fieldError ? (
            <p id={errorId} role="alert" className="text-destructive text-xs">
              {fieldError}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label
            htmlFor={emailId}
            className="text-foreground text-sm font-medium"
          >
            Email
          </label>
          <input
            id={emailId}
            type="email"
            value={user.email}
            readOnly
            aria-readonly="true"
            className="border-input bg-muted text-muted-foreground h-10 cursor-not-allowed rounded-lg border px-3 text-sm outline-none"
          />
          <p className="text-muted-foreground text-xs">
            Email is managed by your sign-in provider and can&apos;t be changed
            here.
          </p>
        </div>

        {mutation.isError ? (
          <p role="alert" className="text-destructive mt-5 text-sm">
            We couldn&apos;t save your changes. Please try again.
          </p>
        ) : null}

        {mutation.isSuccess ? (
          <p role="status" className="text-primary mt-5 text-sm">
            Profile updated.
          </p>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="h-10 rounded-full px-5"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={mutation.isPending || !isDirty}
            className="h-10 rounded-full px-5"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
