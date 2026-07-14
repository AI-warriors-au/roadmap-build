import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider, Prisma } from '@prisma/client';
import { generateState, type GitHub } from 'arctic';
import type { CookieOptions, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_COOKIE_MAX_AGE_MS,
  OAUTH_STATE_COOKIE,
  type OAuthUpsertResult,
  type ProviderProfile,
} from './auth.types';
import { GITHUB_OAUTH } from './oauth-providers';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly session: SessionService,
    @Inject(GITHUB_OAUTH) private readonly github: GitHub | null,
  ) {}

  // Google OAuth disabled until a Google Cloud OAuth app is available.
  // startGoogleAuth(res: Response): void { ... }
  // async handleGoogleCallback(...): Promise<void> { ... }
  // private async fetchGoogleProfile(accessToken: string): Promise<ProviderProfile> { ... }

  startGithubAuth(res: Response): void {
    if (!this.github) {
      this.redirectToError(res);
      return;
    }

    const state = generateState();
    const url = this.github.createAuthorizationURL(state, ['user:email']);

    this.setOAuthCookies(res, state);
    res.redirect(url.toString());
  }

  async handleGithubCallback(
    code: string | undefined,
    state: string | undefined,
    req: Request,
    res: Response,
  ): Promise<void> {
    if (!this.github) {
      this.redirectToError(res);
      return;
    }

    const storedState = req.cookies[OAUTH_STATE_COOKIE] as string | undefined;

    if (!this.isValidState(state, storedState) || !code) {
      this.clearOAuthCookies(res);
      this.redirectToError(res);
      return;
    }

    try {
      const tokens = await this.github.validateAuthorizationCode(code);
      const profile = await this.fetchGithubProfile(tokens.accessToken());
      const upsertResult = await this.upsertUserFromOAuth(profile);
      const callbackUrl = this.buildCallbackRedirectUrl(upsertResult.isNewUser);

      this.clearOAuthCookies(res);

      if (!callbackUrl) {
        res
          .status(500)
          .send('Authentication succeeded but APP_ORIGIN is not configured');
        return;
      }

      try {
        this.session.createSession(upsertResult.userId, res);
      } catch {
        // User was persisted; avoid oauth_failed redirect if only session issuance fails.
        res.redirect(callbackUrl);
        return;
      }

      res.redirect(callbackUrl);
    } catch {
      this.clearOAuthCookies(res);
      this.redirectToError(res);
    }
  }

  async upsertUserFromOAuth(
    profile: ProviderProfile,
  ): Promise<OAuthUpsertResult> {
    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
      select: { userId: true },
    });

    if (existingAccount) {
      return { userId: existingAccount.userId, isNewUser: false };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      return this.ensureOAuthAccountLinked(existingUser.id, profile);
    }

    try {
      const createdUser = await this.prisma.user.create({
        data: {
          email: profile.email,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          oauthAccounts: {
            create: {
              provider: profile.provider,
              providerId: profile.providerId,
              providerEmail: profile.email,
            },
          },
        },
      });
      return { userId: createdUser.id, isNewUser: true };
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const racedUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });
      if (racedUser) {
        return this.ensureOAuthAccountLinked(racedUser.id, profile);
      }

      const racedAccount = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: {
            provider: profile.provider,
            providerId: profile.providerId,
          },
        },
        select: { userId: true },
      });
      if (racedAccount) {
        return { userId: racedAccount.userId, isNewUser: false };
      }

      throw error;
    }
  }

  buildCallbackRedirectUrl(isNewUser: boolean): string | null {
    const origin = this.getAppOrigin();
    if (!origin) {
      return null;
    }

    const url = new URL('/auth/callback', origin);
    url.searchParams.set('new', String(isNewUser));
    return url.toString();
  }

  buildErrorRedirectUrl(): string | null {
    const origin = this.getAppOrigin();
    if (!origin) {
      return null;
    }

    const url = new URL('/auth/callback', origin);
    url.searchParams.set('error', 'oauth_failed');
    return url.toString();
  }

  isValidState(
    queryState: string | undefined,
    cookieState: string | undefined,
  ): boolean {
    return Boolean(queryState && cookieState && queryState === cookieState);
  }

  private async fetchGithubProfile(
    accessToken: string,
  ): Promise<ProviderProfile> {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user profile');
    }

    const user = (await userResponse.json()) as {
      id?: number;
      login?: string;
      name?: string | null;
      avatar_url?: string | null;
    };

    if (!user.id || !user.login) {
      throw new Error('GitHub profile is missing required fields');
    }

    const email = await this.fetchGithubVerifiedEmail(accessToken);
    if (!email) {
      throw new Error('No verified GitHub email available');
    }

    return {
      provider: OAuthProvider.GITHUB,
      providerId: String(user.id),
      email,
      displayName: user.name ?? user.login,
      avatarUrl: user.avatar_url ?? null,
    };
  }

  private async fetchGithubVerifiedEmail(
    accessToken: string,
  ): Promise<string | null> {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub emails');
    }

    const emails = (await response.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;

    const primaryVerified = emails.find(
      (entry) => entry.primary && entry.verified,
    );
    if (primaryVerified) {
      return primaryVerified.email;
    }

    const verified = emails.find((entry) => entry.verified);
    return verified?.email ?? null;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private async ensureOAuthAccountLinked(
    userId: string,
    profile: ProviderProfile,
  ): Promise<OAuthUpsertResult> {
    try {
      await this.prisma.oAuthAccount.create({
        data: {
          userId,
          provider: profile.provider,
          providerId: profile.providerId,
          providerEmail: profile.email,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        const racedAccount = await this.prisma.oAuthAccount.findUnique({
          where: {
            provider_providerId: {
              provider: profile.provider,
              providerId: profile.providerId,
            },
          },
          select: { userId: true },
        });
        if (racedAccount) {
          return { userId: racedAccount.userId, isNewUser: false };
        }
      }
      throw error;
    }

    return { userId, isNewUser: false };
  }

  private getAppOrigin(): string | null {
    return this.config.get<string>('APP_ORIGIN') ?? null;
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: OAUTH_COOKIE_MAX_AGE_MS,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      path: '/',
    };
  }

  private setOAuthCookies(
    res: Response,
    state: string,
    codeVerifier?: string,
  ): void {
    const options = this.getCookieOptions();
    res.cookie(OAUTH_STATE_COOKIE, state, options);
    if (codeVerifier) {
      res.cookie(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, options);
    }
  }

  private clearOAuthCookies(res: Response): void {
    const options = this.getCookieOptions();
    res.clearCookie(OAUTH_STATE_COOKIE, options);
    res.clearCookie(OAUTH_CODE_VERIFIER_COOKIE, options);
  }

  private redirectToError(res: Response): void {
    const url = this.buildErrorRedirectUrl();
    if (!url) {
      res.status(500).send('OAuth failed');
      return;
    }

    res.redirect(url);
  }
}
