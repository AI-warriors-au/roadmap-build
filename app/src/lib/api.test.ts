import { api } from './api'

describe('api', () => {
  it('points to /api with credentials enabled', () => {
    expect(api.defaults.baseURL).toBe('/api')
    expect(api.defaults.withCredentials).toBe(true)
  })
})
