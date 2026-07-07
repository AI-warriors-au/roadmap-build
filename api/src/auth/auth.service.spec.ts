import { ConfigService } from '@nestjs/config';
import { OAuthProvider } from '@prisma/client';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_STATE_COOKIE,
  type ProviderProfile,
} from './auth.types';
import { AuthService } from './auth.service';

jest.mock('arctic', () => {
  class OAuth2RequestError extends Error {
    constructor(
      public readonly code: string,
      public readonly description: string,
    ) {
      super(description);
      this.name = 'OAuth2RequestError';
    }
  }

  return {
    generateState: jest.fn(() => 'generated-state'),
    generateCodeVerifier: jest.fn(() => 'generated-verifier'),
    OAuth2RequestError,
  };
});

import { OAuth2RequestError } from 'arctic';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    oAuthAccount: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let google: {
    createAuthorizationURL: jest.Mock;
    validateAuthorizationCode: jest.Mock;
  };
  let github: {
    createAuthorizationURL: jest.Mock;
    validateAuthorizationCode: jest.Mock;
  };
  let config: { get: jest.Mock };

  const googleProfile: ProviderProfile = {
    provider: OAuthProvider.GOOGLE,
    providerId: 'google-sub-1',
    email: 'user@example.com',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
  };

  beforeEach(() => {
    prisma = {
      oAuthAccount: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    google = {
      createAuthorizationURL: jest
        .fn()
        .mockReturnValue(
          new URL('https://accounts.google.com/o/oauth2/v2/auth?state=test'),
        ),
      validateAuthorizationCode: jest.fn().mockResolvedValue({
        accessToken: () => 'google-access-token',
      }),
    };

    github = {
      createAuthorizationURL: jest
        .fn()
        .mockReturnValue(
          new URL('https://github.com/login/oauth/authorize?state=test'),
        ),
      validateAuthorizationCode: jest.fn().mockResolvedValue({
        accessToken: () => 'github-access-token',
      }),
    };

    config = {
      get: jest.fn((key: string) => {
        if (key === 'APP_ORIGIN') return 'http://localhost:5173';
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      }),
    };

    service = new AuthService(
      config as unknown as ConfigService,
      prisma as unknown as PrismaService,
      google as never,
      github as never,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createResponseMock(): {
    res: Response;
    cookie: jest.Mock;
    clearCookie: jest.Mock;
    redirect: jest.Mock;
  } {
    const cookie = jest.fn();
    const clearCookie = jest.fn();
    const redirect = jest.fn();

    return {
      res: { cookie, clearCookie, redirect } as unknown as Response,
      cookie,
      clearCookie,
      redirect,
    };
  }

  function createRequestMock(cookies: Record<string, string> = {}): Request {
    return { cookies } as Request;
  }

  describe('isValidState', () => {
    it('returns true when query and cookie state match', () => {
      expect(service.isValidState('abc', 'abc')).toBe(true);
    });

    it('returns false when state is missing or mismatched', () => {
      expect(service.isValidState(undefined, 'abc')).toBe(false);
      expect(service.isValidState('abc', undefined)).toBe(false);
      expect(service.isValidState('abc', 'def')).toBe(false);
    });
  });

  describe('buildCallbackRedirectUrl', () => {
    it('builds new-user callback URL', () => {
      expect(service.buildCallbackRedirectUrl(true)).toBe(
        'http://localhost:5173/auth/callback?new=true',
      );
    });

    it('builds returning-user callback URL', () => {
      expect(service.buildCallbackRedirectUrl(false)).toBe(
        'http://localhost:5173/auth/callback?new=false',
      );
    });
  });

  describe('buildErrorRedirectUrl', () => {
    it('builds oauth error callback URL', () => {
      expect(service.buildErrorRedirectUrl()).toBe(
        'http://localhost:5173/auth/callback?error=oauth_failed',
      );
    });
  });

  describe('upsertUserFromOAuth', () => {
    it('returns isNewUser false when OAuth account already exists', async () => {
      prisma.oAuthAccount.findUnique.mockResolvedValue({ id: 'oauth-1' });

      await expect(service.upsertUserFromOAuth(googleProfile)).resolves.toEqual(
        {
          isNewUser: false,
        },
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('links OAuth account to existing user by email', async () => {
      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.oAuthAccount.create.mockResolvedValue({ id: 'oauth-2' });

      await expect(service.upsertUserFromOAuth(googleProfile)).resolves.toEqual(
        {
          isNewUser: false,
        },
      );
      expect(prisma.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          provider: OAuthProvider.GOOGLE,
          providerId: 'google-sub-1',
          providerEmail: 'user@example.com',
        },
      });
    });

    it('creates a new user and OAuth account for first-time sign-in', async () => {
      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-new' });

      await expect(service.upsertUserFromOAuth(googleProfile)).resolves.toEqual(
        {
          isNewUser: true,
        },
      );
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.png',
          oauthAccounts: {
            create: {
              provider: OAuthProvider.GOOGLE,
              providerId: 'google-sub-1',
              providerEmail: 'user@example.com',
            },
          },
        },
      });
    });
  });

  describe('startGoogleAuth', () => {
    it('stores state and code verifier cookies then redirects', () => {
      const { res, cookie, redirect } = createResponseMock();

      service.startGoogleAuth(res);

      expect(google.createAuthorizationURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ['openid', 'profile', 'email'],
      );
      expect(cookie).toHaveBeenCalledWith(
        OAUTH_STATE_COOKIE,
        expect.any(String),
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(cookie).toHaveBeenCalledWith(
        OAUTH_CODE_VERIFIER_COOKIE,
        expect.any(String),
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(redirect).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/v2/auth?state=test',
      );
    });
  });

  describe('startGithubAuth', () => {
    it('stores state cookie then redirects', () => {
      const { res, cookie, redirect } = createResponseMock();

      service.startGithubAuth(res);

      expect(github.createAuthorizationURL).toHaveBeenCalledWith(
        expect.any(String),
        ['user:email'],
      );
      expect(cookie).toHaveBeenCalledWith(
        OAUTH_STATE_COOKIE,
        expect.any(String),
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(redirect).toHaveBeenCalledWith(
        'https://github.com/login/oauth/authorize?state=test',
      );
    });
  });

  describe('handleGoogleCallback', () => {
    it('redirects to error when state is invalid', async () => {
      const { res, clearCookie, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'stored-state' });

      await service.handleGoogleCallback('code', 'other-state', req, res);

      expect(clearCookie).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?error=oauth_failed',
      );
      expect(google.validateAuthorizationCode).not.toHaveBeenCalled();
    });

    it('redirects to callback with new=true for first-time users', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({
        [OAUTH_STATE_COOKIE]: 'state-1',
        [OAUTH_CODE_VERIFIER_COOKIE]: 'verifier-1',
      });

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sub: 'google-sub-1',
            email: 'user@example.com',
            name: 'Test User',
            picture: 'https://example.com/avatar.png',
          }),
      } as Response);

      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-new' });

      await service.handleGoogleCallback('code-1', 'state-1', req, res);

      expect(google.validateAuthorizationCode).toHaveBeenCalledWith(
        'code-1',
        'verifier-1',
      );
      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?new=true',
      );
    });

    it('redirects to callback with new=false for returning users', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({
        [OAUTH_STATE_COOKIE]: 'state-1',
        [OAUTH_CODE_VERIFIER_COOKIE]: 'verifier-1',
      });

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sub: 'google-sub-1',
            email: 'user@example.com',
            name: 'Test User',
          }),
      } as Response);

      prisma.oAuthAccount.findUnique.mockResolvedValue({ id: 'oauth-1' });

      await service.handleGoogleCallback('code-1', 'state-1', req, res);

      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?new=false',
      );
    });

    it('redirects to error when Arctic rejects the authorization code', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({
        [OAUTH_STATE_COOKIE]: 'state-1',
        [OAUTH_CODE_VERIFIER_COOKIE]: 'verifier-1',
      });

      google.validateAuthorizationCode.mockRejectedValue(
        new OAuth2RequestError('invalid_grant', 'Invalid code'),
      );

      await service.handleGoogleCallback('bad-code', 'state-1', req, res);

      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?error=oauth_failed',
      );
    });
  });

  describe('handleGithubCallback', () => {
    it('redirects to error when state is invalid', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'stored-state' });

      await service.handleGithubCallback('code', 'other-state', req, res);

      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?error=oauth_failed',
      );
      expect(github.validateAuthorizationCode).not.toHaveBeenCalled();
    });

    it('redirects to callback with new=false for returning GitHub users', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'state-1' });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 42,
            login: 'octocat',
            name: 'The Octocat',
            email: 'octocat@github.com',
            avatar_url: 'https://github.com/avatar.png',
          }),
      } as Response);

      prisma.oAuthAccount.findUnique.mockResolvedValue({ id: 'oauth-1' });

      await service.handleGithubCallback('code-1', 'state-1', req, res);

      expect(github.validateAuthorizationCode).toHaveBeenCalledWith('code-1');
      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?new=false',
      );
    });

    it('fetches GitHub emails when profile email is hidden', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'state-1' });

      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 42,
              login: 'octocat',
              name: null,
              email: null,
              avatar_url: null,
            }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                email: 'hidden@example.com',
                primary: true,
                verified: true,
              },
            ]),
        } as Response);

      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-new' });

      await service.handleGithubCallback('code-1', 'state-1', req, res);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/emails',
        expect.any(Object),
      );
      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?new=true',
      );
    });
  });
});
