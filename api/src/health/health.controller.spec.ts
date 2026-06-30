import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: { check: jest.Mock };
  let res: { status: jest.Mock; json: jest.Mock };

  beforeEach(async () => {
    healthService = { check: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = module.get(HealthController);
  });

  it('responds with 200 when the service reports ok', async () => {
    healthService.check.mockResolvedValue({
      status: 'ok',
      database: 'connected',
    });

    await controller.health(res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      database: 'connected',
    });
  });

  it('responds with 503 when the service reports unhealthy', async () => {
    healthService.check.mockResolvedValue({
      status: 'unhealthy',
      database: 'disconnected',
    });

    await controller.health(res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: 'unhealthy',
      database: 'disconnected',
    });
  });
});
