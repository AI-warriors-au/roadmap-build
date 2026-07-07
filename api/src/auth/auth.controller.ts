import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Google OAuth disabled until a Google Cloud OAuth app is available.
  // @Get('google')
  // google(@Res() res: Response): void {
  //   this.authService.startGoogleAuth(res);
  // }
  //
  // @Get('google/callback')
  // async googleCallback(
  //   @Query('code') code: string | undefined,
  //   @Query('state') state: string | undefined,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   await this.authService.handleGoogleCallback(code, state, req, res);
  // }

  @Get('github')
  github(@Res() res: Response): void {
    this.authService.startGithubAuth(res);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleGithubCallback(code, state, req, res);
  }
}
