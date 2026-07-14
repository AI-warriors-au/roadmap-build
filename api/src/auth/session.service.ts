import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';
import ms, { type StringValue } from 'ms';
import { resolveJwtExpiresIn } from './jwt-expires-in';
import { SESSION_COOKIE, type JwtPayload } from './auth.types';

@Injectable()
export class SessionService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  createSession(userId: string, res: Response): void {
    const expiresIn = resolveJwtExpiresIn(
      this.config.get<string>('JWT_EXPIRES_IN'),
    );
    const token = this.jwt.sign({ sub: userId } satisfies JwtPayload, {
      expiresIn,
    });

    res.cookie(SESSION_COOKIE, token, this.getCookieOptions(expiresIn));
  }

  clearSession(res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.getBaseCookieOptions());
  }

  private getCookieOptions(expiresIn: StringValue): CookieOptions {
    return {
      ...this.getBaseCookieOptions(),
      maxAge: ms(expiresIn),
    };
  }

  private getBaseCookieOptions(): CookieOptions {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    // Production hosts the app and API on different origins (e.g. separate
    // *.onrender.com subdomains). SameSite=Lax blocks the session cookie on
    // credentialed XHR from the SPA back to the API.
    return {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      path: '/',
    };
  }
}
