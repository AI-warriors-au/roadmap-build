import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<{ status: string; database: string }> {
    const healthy = await this.prisma.isHealthy();
    return {
      status: healthy ? 'ok' : 'unhealthy',
      database: healthy ? 'connected' : 'disconnected',
    };
  }
}
