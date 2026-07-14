import { Body, Controller, Get, Header, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { MeResponse } from './auth.types';

@Controller('user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  /** Requires a valid session cookie (global JwtAuthGuard). */
  @Get('profile')
  @Header('Cache-Control', 'no-store')
  profile(@Req() req: Request): Promise<MeResponse> {
    return this.authService.getCurrentUser(req.user!.id);
  }

  /** Confirms display name and marks the user as onboarded. */
  @Post('onboard')
  onboard(
    @Req() req: Request,
    @Body('displayName') displayName: unknown,
  ): Promise<MeResponse> {
    return this.authService.onboardUser(req.user!.id, displayName);
  }
}
