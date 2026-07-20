import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { RoadmapBundle } from './transform';

export type SeedPrismaClient = Pick<
  PrismaClient,
  | 'roadmap'
  | 'tag'
  | 'roadmapTag'
  | 'topic'
  | 'topicEdge'
  | 'resource'
  | '$transaction'
>;

export interface ImportResult {
  imported: number;
  skipped: number;
  slugs: string[];
}

export function deterministicTopicId(
  roadmapSlug: string,
  nodeId: string,
): string {
  const hash = createHash('sha256')
    .update(`${roadmapSlug}:${nodeId}`)
    .digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function formatTagName(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function importRoadmapBundle(
  prisma: SeedPrismaClient,
  bundle: RoadmapBundle,
): Promise<'imported' | 'skipped'> {
  const existing = await prisma.roadmap.findUnique({
    where: { slug: bundle.slug },
    select: { isSeeded: true },
  });

  if (existing?.isSeeded) {
    return 'skipped';
  }

  await prisma.$transaction(async (tx) => {
    const roadmap = await tx.roadmap.upsert({
      where: { slug: bundle.slug },
      create: {
        slug: bundle.slug,
        title: bundle.title,
        description: bundle.description,
        isSeeded: true,
        isPublished: true,
      },
      update: {
        title: bundle.title,
        description: bundle.description,
        isSeeded: true,
        isPublished: true,
      },
    });

    for (const tagSlug of bundle.tags) {
      const tag = await tx.tag.upsert({
        where: { slug: tagSlug },
        create: {
          slug: tagSlug,
          name: formatTagName(tagSlug),
        },
        update: {},
      });

      await tx.roadmapTag.upsert({
        where: {
          roadmapId_tagId: {
            roadmapId: roadmap.id,
            tagId: tag.id,
          },
        },
        create: {
          roadmapId: roadmap.id,
          tagId: tag.id,
        },
        update: {},
      });
    }

    const topicIdByNodeId = new Map<string, string>();

    for (const node of bundle.nodes) {
      const topicId = deterministicTopicId(bundle.slug, node.id);
      topicIdByNodeId.set(node.id, topicId);

      await tx.topic.upsert({
        where: { id: topicId },
        create: {
          id: topicId,
          roadmapId: roadmap.id,
          title: node.title,
          positionX: node.positionX,
          positionY: node.positionY,
          order: node.order,
        },
        update: {
          title: node.title,
          positionX: node.positionX,
          positionY: node.positionY,
          order: node.order,
        },
      });
    }

    for (const edge of bundle.edges) {
      const sourceId = topicIdByNodeId.get(edge.sourceNodeId);
      const targetId = topicIdByNodeId.get(edge.targetNodeId);
      if (!sourceId || !targetId) {
        continue;
      }

      await tx.topicEdge.upsert({
        where: {
          sourceId_targetId: {
            sourceId,
            targetId,
          },
        },
        create: {
          roadmapId: roadmap.id,
          sourceId,
          targetId,
        },
        update: {},
      });
    }

    for (const resource of bundle.resources) {
      const topicId = topicIdByNodeId.get(resource.nodeId);
      if (!topicId) {
        continue;
      }

      const existingResource = await tx.resource.findFirst({
        where: {
          topicId,
          url: resource.url,
        },
      });

      if (!existingResource) {
        await tx.resource.create({
          data: {
            topicId,
            title: resource.title,
            url: resource.url,
            type: resource.type,
            order: resource.order,
          },
        });
      }
    }
  });

  return 'imported';
}

export async function importRoadmapBundles(
  prisma: SeedPrismaClient,
  bundles: RoadmapBundle[],
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  const slugs: string[] = [];

  for (const bundle of bundles) {
    const outcome = await importRoadmapBundle(prisma, bundle);
    if (outcome === 'imported') {
      imported += 1;
      slugs.push(bundle.slug);
    } else {
      skipped += 1;
    }
  }

  return { imported, skipped, slugs };
}

export type SeedTransactionClient = Omit<SeedPrismaClient, '$transaction'> & {
  $transaction: <T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ) => Promise<T>;
};
