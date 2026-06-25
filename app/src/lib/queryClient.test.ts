import { queryClient } from './queryClient'

describe('queryClient', () => {
  it('configures default query options', () => {
    const defaults = queryClient.getDefaultOptions().queries

    expect(defaults?.retry).toBe(1)
    expect(defaults?.refetchOnWindowFocus).toBe(false)
  })
})
