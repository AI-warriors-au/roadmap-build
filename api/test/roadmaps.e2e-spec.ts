import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { SESSION_COOKIE } from '../src/auth/auth.types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createE2eApp } from './create-e2e-app';

const E2E_USER_EMAIL = 'e2e-roadmaps@example.com';
const E2E_SLUG_PREFIX = 'e2e-catalog-';
const NFR_CATALOG_MAX_MS = 1500;

type CatalogItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: { slug: string; name: string }[];
  topicCount: number;
  isEnrolled: boolean;
};

type CatalogListBody = {
  items: CatalogItem[];
};

function catalogItems(body: unknown): CatalogItem[] {
  return (body as CatalogListBody).items;
}

describe('Roadmaps catalog (e2e)', () => {
  let app: INestApplication<App>;
  let databaseAvailable = false;
  let userId = '';
  let sessionCookie = '';
  let publishedFrontendId = '';
  let publishedBackendId = '';
  let unpublishedId = '';

  beforeEach(async () => {
    process.env.JWT_SECRET = 'e2e-jwt-secret';
    process.env.APP_ORIGIN = 'http://localhost:5173';

    app = await createE2eApp();
    databaseAvailable = await app.get(PrismaService).isHealthy();

    if (!databaseAvailable) {
      return;
    }

    const prisma = app.get(PrismaService);

    await cleanupFixtures(prisma);

    const user = await prisma.user.create({
      data: {
        email: E2E_USER_EMAIL,
        displayName: 'E2E Catalog User',
        onboardedAt: new Date(),
      },
    });
    userId = user.id;

    const token = app.get(JwtService).sign({ sub: userId });
    sessionCookie = `${SESSION_COOKIE}=${token}`;

    const [frontendTag, backendTag, reactTag] = await Promise.all([
      prisma.tag.upsert({
        where: { slug: 'e2e-frontend' },
        create: { slug: 'e2e-frontend', name: 'E2E Frontend' },
        update: { name: 'E2E Frontend' },
      }),
      prisma.tag.upsert({
        where: { slug: 'e2e-backend' },
        create: { slug: 'e2e-backend', name: 'E2E Backend' },
        update: { name: 'E2E Backend' },
      }),
      prisma.tag.upsert({
        where: { slug: 'e2e-react' },
        create: { slug: 'e2e-react', name: 'E2E React' },
        update: { name: 'E2E React' },
      }),
    ]);

    const publishedFrontend = await prisma.roadmap.create({
      data: {
        slug: `${E2E_SLUG_PREFIX}frontend`,
        title: 'E2E Frontend Path',
        description: 'Learn React for the catalog e2e suite',
        isPublished: true,
        isSeeded: false,
        tags: {
          create: [{ tagId: frontendTag.id }, { tagId: reactTag.id }],
        },
        topics: {
          create: [
            { title: 'HTML', order: 0 },
            { title: 'CSS', order: 1 },
            { title: 'React', order: 2 },
          ],
        },
      },
    });
    publishedFrontendId = publishedFrontend.id;

    const publishedBackend = await prisma.roadmap.create({
      data: {
        slug: `${E2E_SLUG_PREFIX}backend`,
        title: 'E2E Backend Path',
        description: 'APIs and databases for catalog e2e',
        isPublished: true,
        isSeeded: false,
        tags: {
          create: [{ tagId: backendTag.id }],
        },
        topics: {
          create: [{ title: 'HTTP', order: 0 }],
        },
      },
    });
    publishedBackendId = publishedBackend.id;

    const unpublished = await prisma.roadmap.create({
      data: {
        slug: `${E2E_SLUG_PREFIX}draft`,
        title: 'E2E Draft Path',
        description: 'Must never appear in catalog',
        isPublished: false,
        isSeeded: false,
        tags: {
          create: [{ tagId: frontendTag.id }],
        },
      },
    });
    unpublishedId = unpublished.id;

    await prisma.enrolment.create({
      data: {
        userId,
        roadmapId: publishedFrontendId,
        unenrolledAt: null,
      },
    });

    await prisma.enrolment.create({
      data: {
        userId,
        roadmapId: publishedBackendId,
        unenrolledAt: new Date(),
      },
    });
  });

  afterEach(async () => {
    if (databaseAvailable) {
      await cleanupFixtures(app.get(PrismaService));
    }

    await app.close();
  });

  function itWithDatabase(name: string, fn: () => Promise<void>): void {
    it(name, async () => {
      if (!databaseAvailable) {
        return;
      }

      await fn();
    });
  }

  it('GET /roadmaps returns 401 without a session cookie', async () => {
    await request(app.getHttpServer()).get('/roadmaps').expect(401);
  });

  itWithDatabase(
    'GET /roadmaps returns published fixtures with catalog fields',
    async () => {
      const response = await request(app.getHttpServer())
        .get('/roadmaps')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.body).toHaveProperty('items');

      const items = catalogItems(response.body);
      const fixtureItems = items.filter((item) =>
        item.slug.startsWith(E2E_SLUG_PREFIX),
      );

      expect(fixtureItems).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: publishedFrontendId,
            slug: `${E2E_SLUG_PREFIX}frontend`,
            title: 'E2E Frontend Path',
            description: 'Learn React for the catalog e2e suite',
            topicCount: 3,
            isEnrolled: true,
            tags: expect.arrayContaining([
              expect.objectContaining({ slug: 'e2e-frontend' }),
              expect.objectContaining({ slug: 'e2e-react' }),
            ]) as CatalogItem['tags'],
          }),
          expect.objectContaining({
            id: publishedBackendId,
            slug: `${E2E_SLUG_PREFIX}backend`,
            title: 'E2E Backend Path',
            topicCount: 1,
            isEnrolled: false,
          }),
        ]),
      );

      expect(fixtureItems.map((item) => item.id)).not.toContain(unpublishedId);
      expect(
        items.some((item) => item.slug === `${E2E_SLUG_PREFIX}draft`),
      ).toBe(false);
    },
  );

  itWithDatabase(
    'GET /roadmaps?search= filters by title/description case-insensitively',
    async () => {
      const response = await request(app.getHttpServer())
        .get('/roadmaps')
        .query({ search: 'react' })
        .set('Cookie', sessionCookie)
        .expect(200);

      const items = catalogItems(response.body).filter((item) =>
        item.slug.startsWith(E2E_SLUG_PREFIX),
      );

      expect(items).toHaveLength(1);
      expect(items[0]?.id).toBe(publishedFrontendId);
    },
  );

  itWithDatabase('GET /roadmaps?tags= matches any tag slug (OR)', async () => {
    const response = await request(app.getHttpServer())
      .get('/roadmaps')
      .query({ tags: 'e2e-frontend,e2e-backend' })
      .set('Cookie', sessionCookie)
      .expect(200);

    const ids = catalogItems(response.body)
      .filter((item) => item.slug.startsWith(E2E_SLUG_PREFIX))
      .map((item) => item.id);

    expect(ids).toEqual(
      expect.arrayContaining([publishedFrontendId, publishedBackendId]),
    );
    expect(ids).not.toContain(unpublishedId);
  });

  itWithDatabase(
    'GET /roadmaps treats soft-unenrolled roadmaps as not enrolled',
    async () => {
      const response = await request(app.getHttpServer())
        .get('/roadmaps')
        .set('Cookie', sessionCookie)
        .expect(200);

      const items = catalogItems(response.body);
      const frontend = items.find((item) => item.id === publishedFrontendId);
      const backend = items.find((item) => item.id === publishedBackendId);

      expect(frontend?.isEnrolled).toBe(true);
      expect(backend?.isEnrolled).toBe(false);
    },
  );

  itWithDatabase(
    'GET /roadmaps responds within NFR-CAT-001 baseline (1.5s)',
    async () => {
      const startedAt = Date.now();
      await request(app.getHttpServer())
        .get('/roadmaps')
        .set('Cookie', sessionCookie)
        .expect(200);
      const elapsedMs = Date.now() - startedAt;

      expect(elapsedMs).toBeLessThan(NFR_CATALOG_MAX_MS);
    },
  );
});

async function cleanupFixtures(prisma: PrismaService): Promise<void> {
  await prisma.enrolment.deleteMany({
    where: {
      OR: [
        { user: { email: E2E_USER_EMAIL } },
        { roadmap: { slug: { startsWith: E2E_SLUG_PREFIX } } },
      ],
    },
  });

  await prisma.roadmap.deleteMany({
    where: { slug: { startsWith: E2E_SLUG_PREFIX } },
  });

  await prisma.tag.deleteMany({
    where: {
      slug: { in: ['e2e-frontend', 'e2e-backend', 'e2e-react'] },
    },
  });

  await prisma.user.deleteMany({
    where: { email: E2E_USER_EMAIL },
  });
}
