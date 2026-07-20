import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RoadmapsService } from './roadmaps.service';

describe('RoadmapsService', () => {
  let service: RoadmapsService;
  let prisma: {
    roadmap: { findMany: jest.Mock };
    enrolment: { findMany: jest.Mock };
  };

  const publishedFrontend = {
    id: 'rm-frontend',
    slug: 'frontend',
    title: 'Frontend',
    description: 'Learn React and modern UI',
    tags: [
      { tag: { slug: 'frontend', name: 'frontend' } },
      { tag: { slug: 'react', name: 'React' } },
    ],
    _count: { topics: 10 },
  };

  const publishedBackend = {
    id: 'rm-backend',
    slug: 'backend',
    title: 'Backend',
    description: 'APIs and databases',
    tags: [{ tag: { slug: 'backend', name: 'backend' } }],
    _count: { topics: 8 },
  };

  beforeEach(async () => {
    prisma = {
      roadmap: { findMany: jest.fn() },
      enrolment: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RoadmapsService);
  });

  it('lists published roadmaps with tags, topicCount, and isEnrolled', async () => {
    prisma.roadmap.findMany.mockResolvedValue([
      publishedBackend,
      publishedFrontend,
    ]);
    prisma.enrolment.findMany.mockResolvedValue([{ roadmapId: 'rm-frontend' }]);

    await expect(service.list('user-1', {})).resolves.toEqual({
      items: [
        {
          id: 'rm-backend',
          slug: 'backend',
          title: 'Backend',
          description: 'APIs and databases',
          tags: [{ slug: 'backend', name: 'backend' }],
          topicCount: 8,
          isEnrolled: false,
        },
        {
          id: 'rm-frontend',
          slug: 'frontend',
          title: 'Frontend',
          description: 'Learn React and modern UI',
          tags: [
            { slug: 'frontend', name: 'frontend' },
            { slug: 'react', name: 'React' },
          ],
          topicCount: 10,
          isEnrolled: true,
        },
      ],
    });

    expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true },
        orderBy: { title: 'asc' },
      }),
    );
    expect(prisma.enrolment.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', unenrolledAt: null },
      select: { roadmapId: true },
    });
  });

  it('always filters to isPublished = true', async () => {
    prisma.roadmap.findMany.mockResolvedValue([]);
    prisma.enrolment.findMany.mockResolvedValue([]);

    await service.list('user-1', { search: 'react' });

    expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: 'react', mode: 'insensitive' } },
            { description: { contains: 'react', mode: 'insensitive' } },
          ],
        },
      }),
    );
  });

  it('applies case-insensitive search on title or description', async () => {
    prisma.roadmap.findMany.mockResolvedValue([publishedFrontend]);
    prisma.enrolment.findMany.mockResolvedValue([]);

    await service.list('user-1', { search: 'react' });

    expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: 'react', mode: 'insensitive' } },
            { description: { contains: 'react', mode: 'insensitive' } },
          ],
        },
      }),
    );
  });

  it('ignores empty or whitespace-only search', async () => {
    prisma.roadmap.findMany.mockResolvedValue([]);
    prisma.enrolment.findMany.mockResolvedValue([]);

    await service.list('user-1', { search: '   ' });

    expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublished: true },
      }),
    );
  });

  it('filters by tag slugs with OR semantics and normalises input', async () => {
    prisma.roadmap.findMany.mockResolvedValue([publishedFrontend]);
    prisma.enrolment.findMany.mockResolvedValue([]);

    await service.list('user-1', { tags: ' Frontend,REACT , ' });

    expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublished: true,
          tags: {
            some: {
              tag: {
                slug: { in: ['frontend', 'react'] },
              },
            },
          },
        },
      }),
    );
  });

  it('combines search and tags with AND between groups', async () => {
    prisma.roadmap.findMany.mockResolvedValue([publishedFrontend]);
    prisma.enrolment.findMany.mockResolvedValue([]);

    await service.list('user-1', { search: 'ui', tags: 'frontend' });

    expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: 'ui', mode: 'insensitive' } },
            { description: { contains: 'ui', mode: 'insensitive' } },
          ],
          tags: {
            some: {
              tag: {
                slug: { in: ['frontend'] },
              },
            },
          },
        },
      }),
    );
  });

  it('sets isEnrolled false when enrolment is soft-unenrolled', async () => {
    prisma.roadmap.findMany.mockResolvedValue([publishedFrontend]);
    // Soft-unenrolled rows are excluded by the unenrolledAt: null filter.
    prisma.enrolment.findMany.mockResolvedValue([]);

    const result = await service.list('user-1', {});

    expect(result.items[0].isEnrolled).toBe(false);
    expect(prisma.enrolment.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', unenrolledAt: null },
      select: { roadmapId: true },
    });
  });
});
