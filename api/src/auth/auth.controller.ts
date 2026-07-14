import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { SessionService } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly session: SessionService,
  ) {}

  // Google OAuth disabled until a Google Cloud OAuth app is available.
  // @Public()
  // @Get('google')
  // google(@Res() res: Response): void {
  //   this.authService.startGoogleAuth(res);
  // }
  //
  // @Public()
  // @Get('google/callback')
  // async googleCallback(
  //   @Query('code') code: string | undefined,
  //   @Query('state') state: string | undefined,
  //   @Req() req: Request,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   await this.authService.handleGoogleCallback(code, state, req, res);
  // }

  @Public()
  @Get('github')
  github(@Res() res: Response): void {
    this.authService.startGithubAuth(res);
  }

  @Public()
  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleGithubCallback(code, state, req, res);
  }

  @Public()
  @Post('logout')
  logout(@Res() res: Response): void {
    this.session.clearSession(res);
    res.status(204).send();
  }
}
