import {
  Controller,
  Get,
  Header,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { ListRoadmapsQueryDto } from './dto/list-roadmaps-query.dto';
import { RoadmapsService } from './roadmaps.service';
import type { ListRoadmapsResponse } from './roadmaps.types';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  /** Authenticated catalog list (global JwtAuthGuard). SPA path: /api/roadmaps. */
  @Get()
  @Header('Cache-Control', 'no-store')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  list(
    @Req() req: Request,
    @Query() query: ListRoadmapsQueryDto,
  ): Promise<ListRoadmapsResponse> {
    return this.roadmapsService.list(req.user!.id, query);
  }
}
