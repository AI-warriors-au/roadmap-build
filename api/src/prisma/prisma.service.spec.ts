import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('isHealthy', () => {
    it('returns true when the database query succeeds', async () => {
      jest.spyOn(service, '$queryRaw').mockResolvedValue([{ '?column?': 1 }]);

      await expect(service.isHealthy()).resolves.toBe(true);
    });

    it('returns false when the database query fails', async () => {
      jest
        .spyOn(service, '$queryRaw')
        .mockRejectedValue(new Error('connection failed'));

      await expect(service.isHealthy()).resolves.toBe(false);
    });
  });

  describe('onModuleInit', () => {
    it('does not throw when the database is unavailable', async () => {
      jest.spyOn(service, '$connect').mockRejectedValue(new Error('refused'));

      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });
  });
});
