import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: { isHealthy: jest.Mock };

  beforeEach(async () => {
    prisma = { isHealthy: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns ok when the database is healthy', async () => {
    prisma.isHealthy.mockResolvedValue(true);

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    });
  });

  it('returns unhealthy when the database is unavailable', async () => {
    prisma.isHealthy.mockResolvedValue(false);

    await expect(service.check()).resolves.toEqual({
      status: 'unhealthy',
      database: 'disconnected',
    });
  });
});
