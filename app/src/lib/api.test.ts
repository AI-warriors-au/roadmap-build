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
    expect(get).toHaveBeenCalledWith('/health', {
      validateStatus: expect.any(Function),
    })
    expect(get.mock.calls[0]?.[1]?.validateStatus?.(200)).toBe(true)
    expect(get.mock.calls[0]?.[1]?.validateStatus?.(503)).toBe(true)
    expect(get.mock.calls[0]?.[1]?.validateStatus?.(500)).toBe(false)
  })
})
