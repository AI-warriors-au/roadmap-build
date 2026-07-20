import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { RoadmapCatalogItem } from '@/lib/api'
import { renderWithProviders } from '@/test/test-utils'

import { RoadmapCard } from './RoadmapCard'

const baseRoadmap: RoadmapCatalogItem = {
  id: 'rm-1',
  slug: 'frontend-developer',
  title: 'Frontend Developer',
  description: 'Build modern UIs with React and TypeScript.',
  tags: [
    { slug: 'frontend', name: 'Frontend' },
    { slug: 'react', name: 'React' },
  ],
  topicCount: 102,
  isEnrolled: false,
}

describe('RoadmapCard', () => {
  it('renders title, tags, description, and topic count', () => {
    renderWithProviders(<RoadmapCard roadmap={baseRoadmap} />)

    expect(
      screen.getByRole('article', { name: 'Frontend Developer' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(
      screen.getByText('Build modern UIs with React and TypeScript.'),
    ).toBeInTheDocument()
    expect(screen.getByText('102 topics')).toBeInTheDocument()
  })

  it('shows an In progress badge when enrolled', () => {
    renderWithProviders(
      <RoadmapCard roadmap={{ ...baseRoadmap, isEnrolled: true }} />,
    )

    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('hides the In progress badge when not enrolled', () => {
    renderWithProviders(<RoadmapCard roadmap={baseRoadmap} />)

    expect(screen.queryByText('In progress')).not.toBeInTheDocument()
  })
})
