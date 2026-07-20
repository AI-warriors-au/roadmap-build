import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';

describe('RoadmapsController', () => {
  let controller: RoadmapsController;
  let roadmapsService: { list: jest.Mock };

  beforeEach(async () => {
    roadmapsService = { list: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapsController],
      providers: [{ provide: RoadmapsService, useValue: roadmapsService }],
    }).compile();

    controller = module.get(RoadmapsController);
  });

  it('GET /roadmaps delegates to the service with the session user id', async () => {
    const payload = {
      items: [
        {
          id: 'rm-1',
          slug: 'frontend',
          title: 'Frontend',
          description: null,
          tags: [{ slug: 'frontend', name: 'frontend' }],
          topicCount: 3,
          isEnrolled: false,
        },
      ],
    };
    roadmapsService.list.mockResolvedValue(payload);

    const query = { search: 'react', tags: 'frontend' };
    await expect(
      controller.list({ user: { id: 'user-1' } } as Request, query),
    ).resolves.toEqual(payload);
    expect(roadmapsService.list).toHaveBeenCalledWith('user-1', query);
  });
});
