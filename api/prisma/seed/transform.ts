import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ResourceType } from '@prisma/client';

export interface RoadmapBundleNode {
  id: string;
  title: string;
  positionX: number;
  positionY: number;
  order: number;
}

export interface RoadmapBundleEdge {
  sourceNodeId: string;
  targetNodeId: string;
}

export interface RoadmapBundleResource {
  nodeId: string;
  title: string;
  url: string;
  type: ResourceType;
  order: number;
}

export interface RoadmapBundle {
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  nodes: RoadmapBundleNode[];
  edges: RoadmapBundleEdge[];
  resources: RoadmapBundleResource[];
}

export interface SeedManifest {
  upstreamRepo: string;
  upstreamSha: string;
  upstreamUrl: string;
  license: string;
  roadmaps: Array<{ slug: string; tags: string[] }>;
}

export interface RawRoadmapBundle {
  slug: string;
  title: string;
  description?: string | null;
  tags?: string[];
  nodes: Array<{
    id: string;
    title: string;
    positionX: number;
    positionY: number;
    order: number;
  }>;
  edges: Array<{
    sourceNodeId: string;
    targetNodeId: string;
  }>;
  resources: Array<{
    nodeId: string;
    title: string;
    url: string;
    type: string;
  }>;
}

const RESOURCE_TYPE_MAP: Record<string, ResourceType> = {
  article: ResourceType.ARTICLE,
  video: ResourceType.VIDEO,
  course: ResourceType.COURSE,
  official: ResourceType.ARTICLE,
  feed: ResourceType.ARTICLE,
  opensource: ResourceType.ARTICLE,
};

export function mapResourceType(rawType: string): ResourceType {
  return RESOURCE_TYPE_MAP[rawType.toLowerCase()] ?? ResourceType.ARTICLE;
}

export function parseRoadmapBundle(raw: RawRoadmapBundle): RoadmapBundle {
  const resourcesByNode = new Map<string, number>();

  const resources = (raw.resources ?? []).map((resource) => {
    const nodeOrder = resourcesByNode.get(resource.nodeId) ?? 0;
    resourcesByNode.set(resource.nodeId, nodeOrder + 1);

    return {
      nodeId: resource.nodeId,
      title: resource.title,
      url: resource.url,
      type: mapResourceType(resource.type),
      order: nodeOrder,
    };
  });

  return {
    slug: raw.slug,
    title: raw.title,
    description: raw.description ?? null,
    tags: raw.tags ?? [],
    nodes: raw.nodes ?? [],
    edges: raw.edges ?? [],
    resources,
  };
}

export function getSeedDataDir(): string {
  return join(__dirname, '..', 'seed-data');
}

export function loadManifest(seedDataDir = getSeedDataDir()): SeedManifest {
  const manifestPath = join(seedDataDir, 'manifest.json');
  const raw = JSON.parse(readFileSync(manifestPath, 'utf8')) as SeedManifest;
  return raw;
}

export function loadRoadmapBundles(
  seedDataDir = getSeedDataDir(),
): RoadmapBundle[] {
  const manifest = loadManifest(seedDataDir);
  const roadmapsDir = join(seedDataDir, 'roadmaps');
  const tagBySlug = new Map(
    manifest.roadmaps.map((entry) => [entry.slug, entry.tags]),
  );

  const bundles: RoadmapBundle[] = [];

  for (const entry of manifest.roadmaps) {
    const filePath = join(roadmapsDir, `${entry.slug}.json`);
    if (!existsSync(filePath)) {
      continue;
    }

    const raw = JSON.parse(readFileSync(filePath, 'utf8')) as RawRoadmapBundle;
    if (!raw.nodes?.length) {
      console.warn(
        `Skipping ${entry.slug}: vendored snapshot has no nodes (re-run fetch-seed-data.mjs to refresh).`,
      );
      continue;
    }

    const bundle = parseRoadmapBundle({
      ...raw,
      tags: raw.tags?.length ? raw.tags : (tagBySlug.get(entry.slug) ?? []),
    });
    bundles.push(bundle);
  }

  return bundles;
}

export function countAvailableRoadmapFiles(
  seedDataDir = getSeedDataDir(),
): number {
  const roadmapsDir = join(seedDataDir, 'roadmaps');
  return readdirSync(roadmapsDir).filter((name) => name.endsWith('.json'))
    .length;
}
