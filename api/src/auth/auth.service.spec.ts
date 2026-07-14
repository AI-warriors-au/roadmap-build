import { ConfigService } from '@nestjs/config';
import { OAuthProvider, Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { OAUTH_STATE_COOKIE, type ProviderProfile } from './auth.types';
import { AuthService } from './auth.service';

jest.mock('arctic', () => ({
  generateState: jest.fn(() => 'generated-state'),
}));

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
  let github: {
    createAuthorizationURL: jest.Mock;
    validateAuthorizationCode: jest.Mock;
  } | null;
  let config: { get: jest.Mock };
  let session: { createSession: jest.Mock };

  const githubProfile: ProviderProfile = {
    provider: OAuthProvider.GITHUB,
    providerId: '42',
    email: 'octocat@github.com',
    displayName: 'The Octocat',
    avatarUrl: 'https://github.com/avatar.png',
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

    session = {
      createSession: jest.fn(),
    };

    service = new AuthService(
      config as unknown as ConfigService,
      prisma as unknown as PrismaService,
      session,
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

  function mockGithubUserAndEmails(
    user: Record<string, unknown>,
    emails: Array<Record<string, unknown>>,
  ): void {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(user),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emails),
      } as Response);
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

    it('returns null when APP_ORIGIN is not configured', () => {
      config.get.mockReturnValue(undefined);

      expect(service.buildErrorRedirectUrl()).toBeNull();
      expect(service.buildCallbackRedirectUrl(true)).toBeNull();
    });
  });

  describe('upsertUserFromOAuth', () => {
    it('returns isNewUser false when OAuth account already exists', async () => {
      prisma.oAuthAccount.findUnique.mockResolvedValue({
        userId: 'user-existing',
      });

      await expect(service.upsertUserFromOAuth(githubProfile)).resolves.toEqual(
        {
          userId: 'user-existing',
          isNewUser: false,
        },
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('links OAuth account to existing user by email', async () => {
      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.oAuthAccount.create.mockResolvedValue({ id: 'oauth-2' });

      await expect(service.upsertUserFromOAuth(githubProfile)).resolves.toEqual(
        {
          userId: 'user-1',
          isNewUser: false,
        },
      );
      expect(prisma.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          provider: OAuthProvider.GITHUB,
          providerId: '42',
          providerEmail: 'octocat@github.com',
        },
      });
    });

    it('creates a new user and OAuth account for first-time sign-in', async () => {
      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-new' });

      await expect(service.upsertUserFromOAuth(githubProfile)).resolves.toEqual(
        {
          userId: 'user-new',
          isNewUser: true,
        },
      );
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'octocat@github.com',
          displayName: 'The Octocat',
          avatarUrl: 'https://github.com/avatar.png',
          oauthAccounts: {
            create: {
              provider: OAuthProvider.GITHUB,
              providerId: '42',
              providerEmail: 'octocat@github.com',
            },
          },
        },
      });
    });

    it('links OAuth account after concurrent user creation race', async () => {
      prisma.oAuthAccount.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'user-1' });
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.19.0',
        }),
      );
      prisma.oAuthAccount.create.mockResolvedValue({ id: 'oauth-2' });

      await expect(service.upsertUserFromOAuth(githubProfile)).resolves.toEqual(
        {
          userId: 'user-1',
          isNewUser: false,
        },
      );
      expect(prisma.oAuthAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          provider: OAuthProvider.GITHUB,
          providerId: '42',
          providerEmail: 'octocat@github.com',
        },
      });
    });
  });

  describe('startGithubAuth', () => {
    it('stores state cookie then redirects', () => {
      const { res, cookie, redirect } = createResponseMock();

      service.startGithubAuth(res);

      expect(github?.createAuthorizationURL).toHaveBeenCalledWith(
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

    it('redirects to error when GitHub OAuth is not configured', () => {
      const unconfiguredService = new AuthService(
        config as unknown as ConfigService,
        prisma as unknown as PrismaService,
        session,
        null,
      );
      const { res, redirect } = createResponseMock();

      unconfiguredService.startGithubAuth(res);

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
      expect(github?.validateAuthorizationCode).not.toHaveBeenCalled();
    });

    it('redirects to callback with new=false for returning GitHub users', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'state-1' });

      mockGithubUserAndEmails(
        {
          id: 42,
          login: 'octocat',
          name: 'The Octocat',
          avatar_url: 'https://github.com/avatar.png',
        },
        [
          {
            email: 'octocat@github.com',
            primary: true,
            verified: true,
          },
        ],
      );

      prisma.oAuthAccount.findUnique.mockResolvedValue({
        userId: 'user-returning',
      });

      await service.handleGithubCallback('code-1', 'state-1', req, res);

      expect(github?.validateAuthorizationCode).toHaveBeenCalledWith('code-1');
      expect(session.createSession).toHaveBeenCalledWith('user-returning', res);
      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?new=false',
      );
    });

    it('uses verified GitHub emails instead of the public profile email', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'state-1' });

      mockGithubUserAndEmails(
        {
          id: 42,
          login: 'octocat',
          name: null,
          avatar_url: null,
        },
        [
          {
            email: 'hidden@example.com',
            primary: true,
            verified: true,
          },
        ],
      );

      prisma.oAuthAccount.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-new' });

      await service.handleGithubCallback('code-1', 'state-1', req, res);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/emails',
        expect.any(Object),
      );
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'hidden@example.com',
          displayName: 'octocat',
          avatarUrl: null,
          oauthAccounts: {
            create: {
              provider: OAuthProvider.GITHUB,
              providerId: '42',
              providerEmail: 'hidden@example.com',
            },
          },
        },
      });
      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?new=true',
      );
    });

    it('redirects to error when profile fetch fails', async () => {
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'state-1' });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
      } as Response);

      await service.handleGithubCallback('code-1', 'state-1', req, res);

      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?error=oauth_failed',
      );
    });

    it('redirects to error when GitHub OAuth is not configured', async () => {
      const unconfiguredService = new AuthService(
        config as unknown as ConfigService,
        prisma as unknown as PrismaService,
        session,
        null,
      );
      const { res, redirect } = createResponseMock();
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'state-1' });

      await unconfiguredService.handleGithubCallback(
        'code-1',
        'state-1',
        req,
        res,
      );

      expect(redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?error=oauth_failed',
      );
    });
    it('responds with 500 when APP_ORIGIN is missing during callback failure', async () => {
      config.get.mockReturnValue(undefined);
      const unconfiguredOriginService = new AuthService(
        config as unknown as ConfigService,
        prisma as unknown as PrismaService,
        session,
        github as never,
      );
      const send = jest.fn();
      const status = jest.fn().mockReturnValue({ send });
      const redirect = jest.fn();
      const res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect,
        status,
        send,
      } as unknown as Response;
      const req = createRequestMock({ [OAUTH_STATE_COOKIE]: 'stored-state' });

      await unconfiguredOriginService.handleGithubCallback(
        'code',
        'other-state',
        req,
        res,
      );

      expect(status).toHaveBeenCalledWith(500);
      expect(send).toHaveBeenCalledWith('OAuth failed');
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});
