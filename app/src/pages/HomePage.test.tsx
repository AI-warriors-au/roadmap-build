import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/test-utils'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders scaffold copy and a shadcn button', () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole('heading', { name: 'Learnmap' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Frontend scaffold is ready. Build features from here.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument()
  })
})
