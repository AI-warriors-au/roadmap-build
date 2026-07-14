import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { MeResponse } from './auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  /** Requires a valid session cookie (global JwtAuthGuard). */
  @Get('profile')
  profile(@Req() req: Request): Promise<MeResponse> {
    return this.authService.getCurrentUser(req.user!.id);
  }

  /** Updates the caller's own display name (email/avatar are read-only). */
  @Patch('profile')
  updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<MeResponse> {
    return this.authService.updateProfile(req.user!.id, dto);
  }
}
