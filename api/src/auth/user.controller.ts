import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { MeResponse } from './auth.types';

@Controller('user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  /** Requires a valid session cookie (global JwtAuthGuard). */
  @Get('profile')
  profile(@Req() req: Request): Promise<MeResponse> {
    return this.authService.getCurrentUser(req.user!.id);
  }
}
