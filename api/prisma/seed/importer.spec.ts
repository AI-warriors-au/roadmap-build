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
  topicDeleteMany: jest.Mock;
  topicEdgeDeleteMany: jest.Mock;
  resourceDeleteMany: jest.Mock;
  roadmapTagDeleteMany: jest.Mock;
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
  const roadmapTagDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const roadmapTagCreate = jest.fn().mockResolvedValue({});
  const topicDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const topicUpsert = jest.fn().mockResolvedValue({});
  const topicEdgeDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const topicEdgeCreate = jest.fn().mockResolvedValue({});
  const resourceDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const resourceCreate = jest.fn().mockResolvedValue({});

  const tx = {
    roadmap: { upsert: roadmapUpsert },
    tag: { upsert: tagUpsert },
    roadmapTag: { deleteMany: roadmapTagDeleteMany, create: roadmapTagCreate },
    topic: { deleteMany: topicDeleteMany, upsert: topicUpsert },
    topicEdge: { deleteMany: topicEdgeDeleteMany, create: topicEdgeCreate },
    resource: {
      deleteMany: resourceDeleteMany,
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
      roadmapTag: {
        deleteMany: roadmapTagDeleteMany,
        create: roadmapTagCreate,
      },
      topic: { deleteMany: topicDeleteMany, upsert: topicUpsert },
      topicEdge: { deleteMany: topicEdgeDeleteMany, create: topicEdgeCreate },
      resource: {
        deleteMany: resourceDeleteMany,
        create: resourceCreate,
      },
      $transaction: transaction,
    },
    roadmapFindUnique,
    transaction,
    topicDeleteMany,
    topicEdgeDeleteMany,
    resourceDeleteMany,
    roadmapTagDeleteMany,
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

  it('removes stale graph data before re-importing an unseeded roadmap', async () => {
    const bundle = createBundle();
    const {
      prisma,
      topicDeleteMany,
      topicEdgeDeleteMany,
      resourceDeleteMany,
      roadmapTagDeleteMany,
    } = createMockPrisma(false);

    await importRoadmapBundle(prisma, bundle);

    expect(roadmapTagDeleteMany).toHaveBeenCalledWith({
      where: { roadmapId: 'roadmap-1' },
    });
    expect(topicDeleteMany).toHaveBeenCalledWith({
      where: {
        roadmapId: 'roadmap-1',
        id: {
          notIn: bundle.nodes.map((node) =>
            deterministicTopicId(bundle.slug, node.id),
          ),
        },
      },
    });
    expect(topicEdgeDeleteMany).toHaveBeenCalledWith({
      where: { roadmapId: 'roadmap-1' },
    });
    expect(resourceDeleteMany).toHaveBeenCalledWith({
      where: {
        topicId: {
          in: bundle.nodes.map((node) =>
            deterministicTopicId(bundle.slug, node.id),
          ),
        },
      },
    });
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
