import { PrismaClient } from '@prisma/client';
import { importRoadmapBundles } from './seed/importer';
import { loadManifest, loadRoadmapBundles } from './seed/transform';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const manifest = loadManifest();
  const bundles = loadRoadmapBundles();

  if (bundles.length === 0) {
    throw new Error(
      'No roadmap bundles found in prisma/seed-data/roadmaps/. Run node scripts/fetch-seed-data.mjs to vendor snapshots.',
    );
  }

  console.log(
    `Seeding ${bundles.length} roadmaps from vendored snapshots (manifest lists ${manifest.roadmaps.length})...`,
  );

  const result = await importRoadmapBundles(prisma, bundles);

  console.log(
    `Seed complete: imported ${result.imported}, skipped ${result.skipped} (already seeded).`,
  );

  if (result.imported > 0) {
    console.log(`Imported slugs: ${result.slugs.join(', ')}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
