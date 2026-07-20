import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListRoadmapsQueryDto } from './dto/list-roadmaps-query.dto';
import type { ListRoadmapsResponse } from './roadmaps.types';

@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    query: ListRoadmapsQueryDto,
  ): Promise<ListRoadmapsResponse> {
    const search = query.search?.trim() ?? '';
    const tagSlugs = this.parseTagSlugs(query.tags);

    const where: Prisma.RoadmapWhereInput = {
      isPublished: true,
    };

    if (search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tagSlugs.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: tagSlugs },
          },
        },
      };
    }

    const [roadmaps, enrolments] = await Promise.all([
      this.prisma.roadmap.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          tags: {
            select: {
              tag: {
                select: {
                  slug: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: { topics: true },
          },
        },
        orderBy: { title: 'asc' },
      }),
      this.prisma.enrolment.findMany({
        where: {
          userId,
          unenrolledAt: null,
        },
        select: { roadmapId: true },
      }),
    ]);

    const enrolledIds = new Set(enrolments.map((row) => row.roadmapId));

    return {
      items: roadmaps.map((roadmap) => ({
        id: roadmap.id,
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        tags: roadmap.tags.map((row) => ({
          slug: row.tag.slug,
          name: row.tag.name,
        })),
        topicCount: roadmap._count.topics,
        isEnrolled: enrolledIds.has(roadmap.id),
      })),
    };
  }

  private parseTagSlugs(tags: string | undefined): string[] {
    if (!tags) {
      return [];
    }

    return tags
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length > 0);
  }
}
