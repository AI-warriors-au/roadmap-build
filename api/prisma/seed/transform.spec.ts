import { ResourceType } from '@prisma/client';
import {
  mapResourceType,
  parseRoadmapBundle,
  type RawRoadmapBundle,
} from './transform';

describe('parseRoadmapBundle', () => {
  const raw: RawRoadmapBundle = {
    slug: 'react',
    title: 'React Developer Roadmap',
    description: 'Learn React',
    tags: ['react', 'frontend'],
    nodes: [
      {
        id: 'node-1',
        title: 'Components',
        positionX: 10,
        positionY: 20,
        order: 0,
      },
    ],
    edges: [
      {
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
      },
    ],
    resources: [
      {
        nodeId: 'node-1',
        title: 'React docs',
        url: 'https://react.dev',
        type: 'official',
      },
      {
        nodeId: 'node-1',
        title: 'React course',
        url: 'https://example.com/course',
        type: 'course',
      },
    ],
  };

  it('maps bundled JSON into internal seed DTO', () => {
    const bundle = parseRoadmapBundle(raw);

    expect(bundle).toEqual({
      slug: 'react',
      title: 'React Developer Roadmap',
      description: 'Learn React',
      tags: ['react', 'frontend'],
      nodes: raw.nodes,
      edges: raw.edges,
      resources: [
        {
          nodeId: 'node-1',
          title: 'React docs',
          url: 'https://react.dev',
          type: ResourceType.ARTICLE,
          order: 0,
        },
        {
          nodeId: 'node-1',
          title: 'React course',
          url: 'https://example.com/course',
          type: ResourceType.COURSE,
          order: 1,
        },
      ],
    });
  });

  it('defaults unknown resource types to ARTICLE', () => {
    expect(mapResourceType('feed')).toBe(ResourceType.ARTICLE);
    expect(mapResourceType('unknown')).toBe(ResourceType.ARTICLE);
  });

  it('maps video resources to VIDEO', () => {
    expect(mapResourceType('video')).toBe(ResourceType.VIDEO);
  });
});

describe('loadRoadmapBundles', () => {
  it('loads one bundle per manifest entry with a vendored JSON file', () => {
    const { loadRoadmapBundles, loadManifest, countAvailableRoadmapFiles } =
      jest.requireActual<typeof import('./transform')>('./transform');

    const manifest = loadManifest();
    const bundles = loadRoadmapBundles();
    const fileCount = countAvailableRoadmapFiles();

    expect(bundles.length).toBeGreaterThan(0);
    expect(bundles.length).toBeLessThanOrEqual(fileCount);
    expect(bundles.length).toBeLessThanOrEqual(manifest.roadmaps.length);
    expect(bundles.every((bundle) => bundle.nodes.length > 0)).toBe(true);
    expect(
      bundles.every(
        (bundle) => bundle.resources.length > 0 || bundle.nodes.length > 0,
      ),
    ).toBe(true);
  });
});
