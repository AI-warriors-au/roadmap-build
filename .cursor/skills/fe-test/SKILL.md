---
name: fe-test
description: >-
  Frontend unit and component tests for learnmap/app — Vitest, React Testing
  Library, renderWithProviders. Use when ImplementerAgent changes app/ code or
  writes frontend tests.
---

# Frontend tests (`app/`)

Testing conventions for **`learnmap/app`**. Read existing tests in the same area first (`*.test.tsx`, `*.test.ts`).

## Verification commands

Run from **`app/`**:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Unit tests | `npm run test` |
| Watch | `npm run test:watch` |

Run lint, build, and test after every frontend change. Record command, exit code, and summary in the implementer handover.

## File layout

| Pattern | Location | Use for |
|---------|----------|---------|
| `ComponentName.test.tsx` | Co-located or next to feature | Components, pages, routing |
| `feature.test.ts` | Co-located with module | Pure functions, hooks logic, API helpers |
| `test/test-utils.tsx` | Shared | `renderWithProviders`, test wrappers |
| `test/setup.ts` | Vitest setup | `@testing-library/jest-dom` |

Prefer co-located `*.test.tsx` beside the file under test (e.g. `TopNav.tsx` → `TopNav.test.tsx`) or group related AC tests in `App.test.tsx` when they exercise routing integration.

## Test utilities

Use **`renderWithProviders`** from `@/test/test-utils` for anything needing Router, QueryClient, or auth:

```typescript
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createMockUser } from '@/contexts/AuthContext'
import { renderWithProviders } from '@/test/test-utils'

import { TopNav } from './TopNav'

describe('TopNav', () => {
  it('highlights Dashboard on the dashboard route', () => {
    renderWithProviders(<TopNav />, { route: '/dashboard' })

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
```

**Auth overrides** for guard tests:

```typescript
renderWithProviders(<App />, {
  route: '/dashboard',
  authUser: null, // unauthenticated → redirect to login
})

renderWithProviders(<App />, {
  route: '/dashboard',
  authUser: createMockUser({ onboardedAt: null }), // → onboarding
})

renderWithProviders(<App />, {
  route: '/dashboard',
  authLoading: true, // → loading spinner, no flash
})
```

## Example — pure module (API helper)

```typescript
import { api, getHealth } from './api'

describe('api', () => {
  it('points to /api with credentials enabled', () => {
    expect(api.defaults.baseURL).toBe('/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('fetches health from /health and accepts 200 or 503', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({
      data: { status: 'ok', database: 'connected' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    })

    await expect(getHealth()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    })
  })
})
```

## Example — user interaction (dropdown, mobile drawer)

Base UI / shadcn menus and sheets often need `pointerEventsCheck: 0` in jsdom:

```typescript
it('opens the user menu and signs out', async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })

  renderWithProviders(<App />, { route: '/dashboard' })

  await user.click(screen.getByRole('button', { name: 'Open user menu' }))
  expect(await screen.findByText('Dev User')).toBeInTheDocument()

  await user.click(screen.getByRole('menuitem', { name: 'Sign out' }))
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
})
```

Scope queries to a landmark when duplicates exist (nav link + breadcrumb):

```typescript
const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
expect(
  within(breadcrumb).getByRole('link', { name: 'Browse Roadmaps' }),
).toHaveAttribute('href', '/browse')
```

## Example — mocking modules

```typescript
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    getHealth: vi.fn(),
  }
})
```

## What to test

| Layer | Focus |
|-------|-------|
| Pages / routing | AC-visible behaviour, guards, redirects, shell layout |
| Components | User-visible output, ARIA roles, active states, callbacks |
| Hooks / lib | Return values, edge cases, error paths |
| Context | Sign out, loading, permission-like state changes |

## Rules

- **Every frontend logic change** needs added or updated unit/component tests before handover
- Map tests to acceptance criteria — name `describe` blocks with story/AC refs when helpful
- Prefer `getByRole` / `findByRole` over test IDs
- Mock at boundaries (API module, fetch) — not implementation details
- Do not delete failing tests to make CI green
- On failure: one focused fix attempt, re-run; else document as blocker in handover
