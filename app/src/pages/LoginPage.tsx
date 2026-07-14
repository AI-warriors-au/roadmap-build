import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'

import { GitHubMark } from '@/components/icons/GitHubMark'
import { BrandIcon } from '@/components/navigation/BrandIcon'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getGithubAuthUrl } from '@/lib/api'
import { cn } from '@/lib/utils'

type LoginLocationState = {
  oauthError?: string
  sessionExpired?: boolean
}

export function LoginPage() {
  const { user, isLoading } = useCurrentUser()
  const location = useLocation()
  const locationState = location.state as LoginLocationState | null
  const oauthError = locationState?.oauthError
  const sessionExpired = locationState?.sessionExpired
  const [connecting, setConnecting] = useState(false)

  if (isLoading) {
    return (
      <div
        className="bg-background-brand flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted-foreground text-sm">Checking sign-in status…</p>
      </div>
    )
  }

  if (user) {
    return (
      <Navigate
        to={user.onboardedAt ? '/dashboard' : '/onboarding'}
        replace
      />
    )
  }

  function startGithubSignIn() {
    if (connecting) {
      return
    }
    setConnecting(true)
    window.location.assign(getGithubAuthUrl())
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
            Sign in with GitHub to start building your learning path.
          </p>

          {sessionExpired ? (
            <p className="text-destructive mb-4 w-full text-sm" role="alert">
              Your session has expired. Please sign in again.
            </p>
          ) : null}

          {oauthError ? (
            <p className="text-destructive mb-4 w-full text-sm" role="alert">
              Sign-in with GitHub failed. Please try again.
            </p>
          ) : null}

          <Button
            type="button"
            disabled={connecting}
            onClick={startGithubSignIn}
            className={cn(
              'h-12 w-full gap-2 rounded-full bg-foreground text-base font-semibold text-background hover:bg-black',
              'focus-visible:border-ring focus-visible:ring-ring/50',
            )}
          >
            {connecting ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Connecting to GitHub…
              </>
            ) : (
              <>
                <GitHubMark className="size-5" />
                Continue with GitHub
              </>
            )}
          </Button>

          <p className="text-muted-foreground mt-3 text-xs">
            GitHub is the only sign-in method for now.
          </p>

          <div className="border-border my-6 w-full border-t" />

          <p className="text-muted-foreground text-xs">
            New here? Signing in with GitHub creates your account automatically.
          </p>

          <p className="text-muted-foreground mt-4 text-xs">
            By continuing you agree to our{' '}
            <a href="#terms" className="text-primary hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <p className="text-muted-foreground mt-5 flex items-center gap-1.5 text-sm">
        <Lock className="size-4 shrink-0" aria-hidden="true" />
        Secure OAuth — we never see your GitHub password.
      </p>
    </div>
  )
}
