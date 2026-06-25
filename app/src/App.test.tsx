import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/test-utils'

import App from './App'

describe('App', () => {
  it('renders the home page at /', () => {
    renderWithProviders(<App />, { route: '/' })

    expect(
      screen.getByRole('heading', { name: 'Learnmap' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument()
  })
})
