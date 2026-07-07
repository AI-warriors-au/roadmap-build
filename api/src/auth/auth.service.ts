import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProvider } from '@prisma/client';
import {
  generateCodeVerifier,
  generateState,
  type GitHub,
  type Google,
  OAuth2RequestError,
} from 'arctic';
import type { CookieOptions, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_COOKIE_MAX_AGE_MS,
  OAUTH_STATE_COOKIE,
  type ProviderProfile,
} from './auth.types';
import { GITHUB_OAUTH, GOOGLE_OAUTH } from './oauth-providers';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(GOOGLE_OAUTH) private readonly google: Google,
    @Inject(GITHUB_OAUTH) private readonly github: GitHub,
  ) {}

  startGoogleAuth(res: Response): void {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = this.google.createAuthorizationURL(state, codeVerifier, [
      'openid',
      'profile',
      'email',
    ]);

    this.setOAuthCookies(res, state, codeVerifier);
    res.redirect(url.toString());
  }

  async handleGoogleCallback(
    code: string | undefined,
    state: string | undefined,
    req: Request,
    res: Response,
  ): Promise<void> {
    const storedState = req.cookies[OAUTH_STATE_COOKIE] as string | undefined;
    const codeVerifier = req.cookies[OAUTH_CODE_VERIFIER_COOKIE] as
      | string
      | undefined;

    if (!this.isValidState(state, storedState) || !code || !codeVerifier) {
      this.clearOAuthCookies(res);
      this.redirectToError(res);
      return;
    }

    try {
      const tokens = await this.google.validateAuthorizationCode(
        code,
        codeVerifier,
      );
      const profile = await this.fetchGoogleProfile(tokens.accessToken());
      const { isNewUser } = await this.upsertUserFromOAuth(profile);
      this.clearOAuthCookies(res);
      this.redirectToCallback(res, isNewUser);
    } catch (error) {
      if (error instanceof OAuth2RequestError) {
        this.clearOAuthCookies(res);
        this.redirectToError(res);
        return;
      }
      throw error;
    }
  }

  startGithubAuth(res: Response): void {
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
    const storedState = req.cookies[OAUTH_STATE_COOKIE] as string | undefined;

    if (!this.isValidState(state, storedState) || !code) {
      this.clearOAuthCookies(res);
      this.redirectToError(res);
      return;
    }

    try {
      const tokens = await this.github.validateAuthorizationCode(code);
      const profile = await this.fetchGithubProfile(tokens.accessToken());
      const { isNewUser } = await this.upsertUserFromOAuth(profile);
      this.clearOAuthCookies(res);
      this.redirectToCallback(res, isNewUser);
    } catch (error) {
      if (error instanceof OAuth2RequestError) {
        this.clearOAuthCookies(res);
        this.redirectToError(res);
        return;
      }
      throw error;
    }
  }

  async upsertUserFromOAuth(
    profile: ProviderProfile,
  ): Promise<{ isNewUser: boolean }> {
    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
    });

    if (existingAccount) {
      return { isNewUser: false };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      await this.prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: profile.provider,
          providerId: profile.providerId,
          providerEmail: profile.email,
        },
      });
      return { isNewUser: false };
    }
    await this.prisma.user.create({
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

    return { isNewUser: true };
  }

  buildCallbackRedirectUrl(isNewUser: boolean): string {
    const url = new URL('/auth/callback', this.getAppOrigin());
    url.searchParams.set('new', String(isNewUser));
    return url.toString();
  }

  buildErrorRedirectUrl(): string {
    const url = new URL('/auth/callback', this.getAppOrigin());
    url.searchParams.set('error', 'oauth_failed');
    return url.toString();
  }

  isValidState(
    queryState: string | undefined,
    cookieState: string | undefined,
  ): boolean {
    return Boolean(queryState && cookieState && queryState === cookieState);
  }

  private async fetchGoogleProfile(
    accessToken: string,
  ): Promise<ProviderProfile> {
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google user profile');
    }

    const user = (await response.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!user.sub || !user.email) {
      throw new Error('Google profile is missing required fields');
    }

    return {
      provider: OAuthProvider.GOOGLE,
      providerId: user.sub,
      email: user.email,
      displayName: user.name ?? user.email,
      avatarUrl: user.picture ?? null,
    };
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
      email?: string | null;
      avatar_url?: string | null;
    };

    if (!user.id || !user.login) {
      throw new Error('GitHub profile is missing required fields');
    }

    let email = user.email;
    if (!email) {
      email = await this.fetchGithubPrimaryEmail(accessToken);
    }

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

  private async fetchGithubPrimaryEmail(
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

  private getAppOrigin(): string {
    const origin = this.config.get<string>('APP_ORIGIN');
    if (!origin) {
      throw new Error('APP_ORIGIN is not configured');
    }
    return origin;
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

  private redirectToCallback(res: Response, isNewUser: boolean): void {
    res.redirect(this.buildCallbackRedirectUrl(isNewUser));
  }

  private redirectToError(res: Response): void {
    res.redirect(this.buildErrorRedirectUrl());
  }
}
