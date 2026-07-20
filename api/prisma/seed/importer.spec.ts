import { ResourceType } from '@prisma/client';
import {
  deterministicTopicId,
  importRoadmapBundle,
  importRoadmapBundles,
  type SeedPrismaClient,
} from './importer';
import type { RoadmapBundle } from './transform';

function createBundle(overrides: Partial<RoadmapBundle> = {}): RoadmapBundle {
  return {
    slug: 'react',
    title: 'React Roadmap',
    description: 'Learn React',
    tags: ['react', 'frontend'],
    nodes: [
      {
        id: 'node-1',
        title: 'Components',
        positionX: 0,
        positionY: 0,
        order: 0,
      },
      {
        id: 'node-2',
        title: 'Hooks',
        positionX: 10,
        positionY: 10,
        order: 1,
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
        type: ResourceType.ARTICLE,
        order: 0,
      },
    ],
    ...overrides,
  };
}

function createMockPrisma(existingSeeded = false): {
  prisma: SeedPrismaClient;
  roadmapFindUnique: jest.Mock;
  transaction: jest.Mock;
} {
  const roadmapFindUnique = jest
    .fn()
    .mockResolvedValue(existingSeeded ? { isSeeded: true } : null);
  const roadmapUpsert = jest.fn().mockResolvedValue({ id: 'roadmap-1' });
  const tagUpsert = jest
    .fn()
    .mockImplementation(({ where }: { where: { slug: string } }) =>
      Promise.resolve({ id: `tag-${where.slug}`, slug: where.slug }),
    );
  const roadmapTagUpsert = jest.fn().mockResolvedValue({});
  const topicUpsert = jest.fn().mockResolvedValue({});
  const topicEdgeUpsert = jest.fn().mockResolvedValue({});
  const resourceFindFirst = jest.fn().mockResolvedValue(null);
  const resourceCreate = jest.fn().mockResolvedValue({});

  const tx = {
    roadmap: { upsert: roadmapUpsert },
    tag: { upsert: tagUpsert },
    roadmapTag: { upsert: roadmapTagUpsert },
    topic: { upsert: topicUpsert },
    topicEdge: { upsert: topicEdgeUpsert },
    resource: {
      findFirst: resourceFindFirst,
      create: resourceCreate,
    },
  };

  const transaction = jest.fn(
    async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
  );

  return {
    prisma: {
      roadmap: { findUnique: roadmapFindUnique },
      tag: { upsert: tagUpsert },
      roadmapTag: { upsert: roadmapTagUpsert },
      topic: { upsert: topicUpsert },
      topicEdge: { upsert: topicEdgeUpsert },
      resource: {
        findFirst: resourceFindFirst,
        create: resourceCreate,
      },
      $transaction: transaction,
    },
    roadmapFindUnique,
    transaction,
  };
}

describe('deterministicTopicId', () => {
  it('returns a stable UUID-shaped id for a roadmap node', () => {
    const first = deterministicTopicId('react', 'node-1');
    const second = deterministicTopicId('react', 'node-1');

    expect(first).toBe(second);
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

describe('importRoadmapBundle', () => {
  it('imports a roadmap when it does not exist', async () => {
    const { prisma, roadmapFindUnique, transaction } = createMockPrisma(false);

    await expect(importRoadmapBundle(prisma, createBundle())).resolves.toBe(
      'imported',
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(roadmapFindUnique).toHaveBeenCalledWith({
      where: { slug: 'react' },
      select: { isSeeded: true },
    });
  });

  it('skips a roadmap that is already seeded', async () => {
    const { prisma, transaction } = createMockPrisma(true);

    await expect(importRoadmapBundle(prisma, createBundle())).resolves.toBe(
      'skipped',
    );

    expect(transaction).not.toHaveBeenCalled();
  });
});

describe('importRoadmapBundles', () => {
  it('imports all bundles on first run and skips on second run', async () => {
    const { prisma: firstPrisma } = createMockPrisma(false);
    const bundles = [
      createBundle({ slug: 'react' }),
      createBundle({ slug: 'vue', title: 'Vue Roadmap', tags: ['vue'] }),
    ];

    const firstResult = await importRoadmapBundles(firstPrisma, bundles);
    expect(firstResult).toEqual({
      imported: 2,
      skipped: 0,
      slugs: ['react', 'vue'],
    });

    const { prisma: secondPrisma } = createMockPrisma(true);
    const secondResult = await importRoadmapBundles(secondPrisma, bundles);
    expect(secondResult).toEqual({
      imported: 0,
      skipped: 2,
      slugs: [],
    });
  });
});
