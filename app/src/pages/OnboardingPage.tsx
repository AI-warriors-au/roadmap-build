import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { AuthLoadingState } from '@/components/auth/AuthLoadingState'
import { BrandIcon } from '@/components/navigation/BrandIcon'
import { Button } from '@/components/ui/button'
import { CURRENT_USER_QUERY_KEY, useCurrentUser } from '@/hooks/useCurrentUser'
import { onboardUser } from '@/lib/api'
import { cn } from '@/lib/utils'

export function OnboardingPage() {
  const { user, isLoading } = useCurrentUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState('')
  const [hasEditedDisplayName, setHasEditedDisplayName] = useState(false)

  useEffect(() => {
    if (user && !hasEditedDisplayName) {
      setDisplayName(user.displayName)
    }
  }, [user, hasEditedDisplayName])

  const onboardMutation = useMutation({
    mutationFn: onboardUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser)
      void navigate('/dashboard', { replace: true })
    },
  })

  if (isLoading || !user) {
    return <AuthLoadingState />
  }

  return (
    <div className="bg-background-brand flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center px-6 py-10">
      <div
        className={cn(
          'border-border bg-card text-card-foreground w-full max-w-[420px] rounded-2xl border p-10 shadow-md',
          'max-[479px]:p-6',
        )}
      >
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 inline-flex" role="img" aria-label="Learnmap">
            <BrandIcon size={48} />
          </span>

          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Welcome to Learnmap
          </h1>
          <p className="text-muted-foreground mt-2 mb-8 text-base leading-relaxed">
            Confirm how you&apos;d like to appear to other learners.
          </p>

          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="border-border mb-6 size-20 rounded-full border object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="bg-muted text-muted-foreground mb-6 flex size-20 items-center justify-center rounded-full text-2xl font-semibold"
            >
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <form
            className="w-full text-left"
            onSubmit={(event) => {
              event.preventDefault()
              if (!displayName.trim() || onboardMutation.isPending) {
                return
              }
              onboardMutation.mutate({ displayName: displayName.trim() })
            }}
          >
            <label
              htmlFor="display-name"
              className="text-foreground mb-2 block text-sm font-medium"
            >
              Display name
            </label>
            <input
              id="display-name"
              name="displayName"
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(event) => {
                setHasEditedDisplayName(true)
                setDisplayName(event.target.value)
              }}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mb-4 h-11 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />

            {onboardMutation.isError ? (
              <p className="text-destructive mb-4 text-sm" role="alert">
                Could not save your profile. Please try again.
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={onboardMutation.isPending || !displayName.trim()}
              className="h-12 w-full rounded-full text-base font-semibold"
            >
              {onboardMutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                'Continue to dashboard'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
