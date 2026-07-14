import type { MeResponse } from '@/lib/api'

export type AuthUser = MeResponse

export function createMockUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 'user-1',
    email: 'dev@example.com',
    displayName: 'Dev User',
    avatarUrl: null,
    onboardedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
