import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { api, setSessionExpiredHandler } from './api'

describe('api session expiry interceptor', () => {
  it('invokes the session expired handler on non-auth 401 responses', async () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)

    const previousAdapter = api.defaults.adapter
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const error = new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        config,
        {},
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: {},
        },
      )
      throw error
    }

    await expect(api.get('/user/settings')).rejects.toBeInstanceOf(AxiosError)
    expect(handler).toHaveBeenCalledOnce()

    api.defaults.adapter = previousAdapter
    setSessionExpiredHandler(null)
  })

  it('invokes the handler for onboard 401 responses', async () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)

    const previousAdapter = api.defaults.adapter
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const error = new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        config,
        {},
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: {},
        },
      )
      throw error
    }

    await expect(
      api.post('/user/onboard', { displayName: 'Ada' }),
    ).rejects.toBeInstanceOf(AxiosError)
    expect(handler).toHaveBeenCalledOnce()

    api.defaults.adapter = previousAdapter
    setSessionExpiredHandler(null)
  })

  it('does not invoke the handler for profile session checks', async () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)

    const previousAdapter = api.defaults.adapter
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const error = new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        config,
        {},
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: {},
        },
      )
      throw error
    }

    await expect(api.get('/user/profile')).rejects.toBeInstanceOf(AxiosError)
    expect(handler).not.toHaveBeenCalled()

    api.defaults.adapter = previousAdapter
    setSessionExpiredHandler(null)
  })
})
