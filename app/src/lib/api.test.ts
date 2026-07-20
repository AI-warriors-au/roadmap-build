import { describe, expect, it, vi } from 'vitest'

import {
  api,
  getGithubAuthUrl,
  getHealth,
  getMe,
  getRoadmaps,
  onboardUser,
  postLogout,
} from './api'

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
    expect(get).toHaveBeenCalledWith('/health', {
      validateStatus: expect.any(Function),
    })
    expect(get.mock.calls[0]?.[1]?.validateStatus?.(200)).toBe(true)
    expect(get.mock.calls[0]?.[1]?.validateStatus?.(503)).toBe(true)
    expect(get.mock.calls[0]?.[1]?.validateStatus?.(500)).toBe(false)
  })

  it('fetches the current user from /user/profile', async () => {
    const me = {
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({
      data: me,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    })

    await expect(getMe()).resolves.toEqual(me)
    expect(get).toHaveBeenCalledWith('/user/profile', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })
  })

  it('builds the GitHub OAuth start URL from the API base', () => {
    expect(getGithubAuthUrl()).toBe('/api/auth/github')
  })

  it('posts onboarding data to /user/onboard', async () => {
    const me = {
      id: 'user-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      avatarUrl: null,
      onboardedAt: '2026-01-15T00:00:00.000Z',
    }
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: me,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    })

    await expect(onboardUser({ displayName: 'Ada Lovelace' })).resolves.toEqual(
      me,
    )
    expect(post).toHaveBeenCalledWith('/user/onboard', {
      displayName: 'Ada Lovelace',
    })
  })

  it('posts logout to /auth/logout', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: { headers: {} },
    })

    await expect(postLogout()).resolves.toBeUndefined()
    expect(post).toHaveBeenCalledWith('/auth/logout')
  })

  it('fetches roadmaps from /roadmaps with search and tags params', async () => {
    const response = {
      items: [
        {
          id: 'rm-1',
          slug: 'frontend-developer',
          title: 'Frontend Developer',
          description: 'Learn frontend',
          tags: [{ slug: 'react', name: 'React' }],
          topicCount: 10,
          isEnrolled: false,
        },
      ],
    }
    const get = vi.spyOn(api, 'get').mockResolvedValue({
      data: response,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    })

    await expect(
      getRoadmaps({ search: ' front ', tags: ['react', 'frontend'] }),
    ).resolves.toEqual(response)
    expect(get).toHaveBeenCalledWith('/roadmaps', {
      params: { search: 'front', tags: 'react,frontend' },
    })
  })

  it('omits empty search and tags from the roadmaps query', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({
      data: { items: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    })

    await expect(getRoadmaps({ search: '   ', tags: [] })).resolves.toEqual({
      items: [],
    })
    expect(get).toHaveBeenCalledWith('/roadmaps', { params: {} })
  })
})
