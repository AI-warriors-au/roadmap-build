import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';
import {
  JWT_DEFAULT_EXPIRES_IN,
  SESSION_COOKIE,
  type JwtPayload,
} from './auth.types';

@Injectable()
export class SessionService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  createSession(userId: string, res: Response): void {
    const token = this.jwt.sign({ sub: userId } satisfies JwtPayload);
    res.cookie(SESSION_COOKIE, token, this.getCookieOptions());
  }

  clearSession(res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.getCookieOptions());
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('NODE_ENV') === 'production',
      path: '/',
      maxAge: this.getSessionMaxAgeMs(),
    };
  }

  private getSessionMaxAgeMs(): number {
    const expiresIn =
      this.config.get<string>('JWT_EXPIRES_IN') ?? JWT_DEFAULT_EXPIRES_IN;
    const match = /^(\d+)([dhms])$/.exec(expiresIn);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
