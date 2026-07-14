import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

import type { AuthUser } from '@/contexts/AuthContext'
import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser'
import type { MeResponse } from '@/lib/api'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
}

type RenderWithProvidersOptions = RenderOptions & {
  route?: string
  routeState?: unknown
  authUser?: AuthUser | null
  authLoading?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    routeState,
    authUser,
    authLoading = false,
    ...options
  }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient()

  if (authLoading) {
    queryClient.setQueryDefaults(CURRENT_USER_QUERY_KEY, {
      queryFn: () => new Promise<MeResponse>(() => undefined),
    })
  } else if (authUser) {
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, authUser)
  }

  const initialEntry = routeState
    ? { pathname: route, state: routeState }
    : route

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
    options,
  )
}
