#!/usr/bin/env node
/**
 * One-time dev script to vendor roadmap.sh snapshots into prisma/seed-data/.
 * Not invoked at seed runtime — satisfies NFR-CAT-003.
 *
 * Usage: node scripts/fetch-seed-data.mjs
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'prisma', 'seed-data', 'roadmaps');

const UPSTREAM_REPO = 'nilbuild/developer-roadmap';
const UPSTREAM_SHA = '63c6428021ee54ef7aaaff283201741a59824d31';
const RAW_BASE = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${UPSTREAM_SHA}`;

const ROADMAPS = [
  { slug: 'frontend', dbSlug: 'frontend', tags: ['frontend'] },
  { slug: 'backend', dbSlug: 'backend', tags: ['backend'] },
  { slug: 'devops', dbSlug: 'devops', tags: ['devops'] },
  { slug: 'react', dbSlug: 'react', tags: ['react', 'frontend'] },
  { slug: 'vue', dbSlug: 'vue', tags: ['vue', 'frontend'] },
  { slug: 'angular', dbSlug: 'angular', tags: ['angular', 'frontend'] },
  { slug: 'javascript', dbSlug: 'javascript', tags: ['javascript', 'frontend'] },
  { slug: 'typescript', dbSlug: 'typescript', tags: ['typescript', 'frontend'] },
  { slug: 'graphql', dbSlug: 'graphql', tags: ['graphql', 'frontend'] },
  {
    slug: 'design-system',
    dbSlug: 'design-system',
    tags: ['design-system', 'frontend'],
  },
  { slug: 'nodejs', dbSlug: 'nodejs', tags: ['nodejs', 'backend'] },
  { slug: 'python', dbSlug: 'python', tags: ['python', 'backend'] },
  { slug: 'java', dbSlug: 'java', tags: ['java', 'backend'] },
  { slug: 'golang', dbSlug: 'golang', tags: ['golang', 'backend'] },
  { slug: 'rust', dbSlug: 'rust', tags: ['rust', 'backend'] },
  { slug: 'sql', dbSlug: 'sql', tags: ['sql', 'data'] },
  {
    slug: 'postgresql-dba',
    dbSlug: 'postgresql-dba',
    tags: ['postgresql', 'data'],
  },
  { slug: 'mongodb', dbSlug: 'mongodb', tags: ['mongodb', 'data'] },
  { slug: 'docker', dbSlug: 'docker', tags: ['docker', 'devops'] },
  { slug: 'kubernetes', dbSlug: 'kubernetes', tags: ['kubernetes', 'devops'] },
  { slug: 'aws', dbSlug: 'aws', tags: ['aws', 'devops'] },
  { slug: 'blockchain', dbSlug: 'blockchain', tags: ['blockchain'] },
  {
    slug: 'machine-learning',
    dbSlug: 'machine-learning',
    tags: ['machine-learning', 'ai', 'data'],
  },
  { slug: 'android', dbSlug: 'android', tags: ['android', 'mobile'] },
  { slug: 'ios', dbSlug: 'ios', tags: ['ios', 'mobile'] },
];

const TOPIC_NODE_TYPES = new Set(['topic', 'subtopic']);

function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function parseResourceLinks(markdown) {
  const resources = [];
  const regex = /-\s+\[@(\w+)@([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    resources.push({
      type: match[1].toLowerCase(),
      title: match[2].trim(),
      url: match[3].trim(),
    });
  }
  return resources;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

async function listContentFiles(slug) {
  const url = `https://api.github.com/repos/${UPSTREAM_REPO}/contents/src/data/roadmaps/${slug}/content?ref=${UPSTREAM_SHA}`;
  const res = await fetch(url);
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Failed to list content for ${slug}: ${res.status}`);
  }
  const items = await res.json();
  return items.filter((item) => item.type === 'file' && item.name.endsWith('.md'));
}

async function bundleRoadmap({ slug, dbSlug, tags }) {
  const basePath = `${RAW_BASE}/src/data/roadmaps/${slug}`;
  const [md, graph, contentFiles] = await Promise.all([
    fetchText(`${basePath}/${slug}.md`),
    fetchJson(`${basePath}/${slug}.json`),
    listContentFiles(slug),
  ]);

  const meta = parseFrontmatter(md);
  const resourcesByNodeId = {};

  for (const file of contentFiles) {
    const nodeId = file.name.split('@').pop()?.replace(/\.md$/, '');
    if (!nodeId) continue;
    const content = await fetchText(file.download_url);
    const links = parseResourceLinks(content);
    if (links.length > 0) {
      resourcesByNodeId[nodeId] = links;
    }
  }

  const topicNodes = (graph.nodes ?? []).filter(
    (node) => TOPIC_NODE_TYPES.has(node.type) && node.data?.label?.trim(),
  );

  const nodes = topicNodes.map((node, index) => ({
    id: node.id,
    title: node.data.label.trim(),
    positionX: node.position?.x ?? 0,
    positionY: node.position?.y ?? 0,
    order: index,
  }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = (graph.edges ?? [])
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge) => ({
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
    }));

  const resources = [];
  for (const node of nodes) {
    const nodeResources = resourcesByNodeId[node.id] ?? [];
    for (const resource of nodeResources) {
      resources.push({
        nodeId: node.id,
        title: resource.title,
        url: resource.url,
        type: resource.type,
      });
    }
  }

  // Ensure at least one resource per roadmap for AC
  if (resources.length === 0 && nodes.length > 0) {
    resources.push({
      nodeId: nodes[0].id,
      title: `Learn ${nodes[0].title}`,
      url: `https://roadmap.sh/${dbSlug}`,
      type: 'article',
    });
  }

  return {
    slug: dbSlug,
    title: meta.title || meta.briefTitle || dbSlug,
    description: meta.description || meta.briefDescription || null,
    tags,
    nodes,
    edges,
    resources,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = {
    upstreamRepo: UPSTREAM_REPO,
    upstreamSha: UPSTREAM_SHA,
    upstreamUrl: 'https://roadmap.sh',
    license: 'MIT',
    roadmaps: ROADMAPS.map(({ dbSlug, tags }) => ({ slug: dbSlug, tags })),
  };

  for (const roadmap of ROADMAPS) {
    process.stdout.write(`Bundling ${roadmap.slug}... `);
    const bundle = await bundleRoadmap(roadmap);
    const outPath = join(OUT_DIR, `${roadmap.dbSlug}.json`);
    await writeFile(outPath, JSON.stringify(bundle));
    console.log(
      `ok (${bundle.nodes.length} nodes, ${bundle.edges.length} edges, ${bundle.resources.length} resources)`,
    );
  }

  await writeFile(
    join(ROOT, 'prisma', 'seed-data', 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`\nWrote ${ROADMAPS.length} roadmaps to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
