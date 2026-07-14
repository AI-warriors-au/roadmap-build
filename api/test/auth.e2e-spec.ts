import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { OAUTH_STATE_COOKIE, SESSION_COOKIE } from '../src/auth/auth.types';
import { createE2eApp } from './create-e2e-app';

const APP_ORIGIN = 'http://localhost:5173';
const E2E_GITHUB_EMAIL = 'e2e-oauth@example.com';
const E2E_GITHUB_PROVIDER_ID = '9001';
const NFR_AUTH_CALLBACK_MAX_MS = 500;

function mockGithubProfileFetch(): void {
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: Number(E2E_GITHUB_PROVIDER_ID),
          login: 'e2e-user',
          name: 'E2E User',
          avatar_url: null,
        }),
    } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            email: E2E_GITHUB_EMAIL,
            primary: true,
            verified: true,
          },
        ]),
    } as Response);
}

async function completeGithubCallback(
  agent: ReturnType<typeof request.agent>,
): Promise<request.Response> {
  await agent.get('/auth/github').expect(302);

  return agent
    .get('/auth/github/callback')
    .query({ code: 'test-code', state: 'e2e-test-state' })
    .expect(302);
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let databaseAvailable = false;

  beforeEach(async () => {
    process.env.APP_ORIGIN = APP_ORIGIN;
    process.env.JWT_SECRET = 'e2e-jwt-secret';
    process.env.ROADMAP_GITHUB_CLIENT_ID = 'e2e-github-client-id';
    process.env.ROADMAP_GITHUB_CLIENT_SECRET = 'e2e-github-client-secret';
    process.env.ROADMAP_GITHUB_REDIRECT_URI =
      'http://localhost:3000/auth/github/callback';

    app = await createE2eApp();
    databaseAvailable = await app.get(PrismaService).isHealthy();
  });

  afterEach(async () => {
    if (databaseAvailable) {
      const prisma = app.get(PrismaService);
      await prisma.oAuthAccount.deleteMany({
        where: { providerId: E2E_GITHUB_PROVIDER_ID },
      });
      await prisma.user.deleteMany({
        where: { email: E2E_GITHUB_EMAIL },
      });
    }

    await app.close();
    jest.restoreAllMocks();
  });

  function itWithDatabase(name: string, fn: () => Promise<void>): void {
    it(name, async () => {
      if (!databaseAvailable) {
        return;
      }

      await fn();
    });
  }

  it('GET /auth/github redirects to GitHub and sets state cookie', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/github')
      .expect(302);

    expect(response.headers.location).toMatch(
      /^https:\/\/github\.com\/login\/oauth\/authorize/,
    );

    const cookieHeader = response.headers['set-cookie'];
    const cookieValues = Array.isArray(cookieHeader)
      ? cookieHeader.join('; ')
      : String(cookieHeader ?? '');
    expect(cookieValues).toContain(`${OAUTH_STATE_COOKIE}=`);
  });

  it('GET /auth/github/callback redirects to error when state is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/github/callback')
      .query({ code: 'test-code', state: 'invalid-state' })
      .expect(302);

    expect(response.headers.location).toBe(
      `${APP_ORIGIN}/#/auth/callback?error=oauth_failed`,
    );
  });

  it('GET /auth/github/callback redirects to error when state cookie is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/github/callback')
      .query({ code: 'test-code', state: 'e2e-test-state' })
      .expect(302);

    expect(response.headers.location).toBe(
      `${APP_ORIGIN}/#/auth/callback?error=oauth_failed`,
    );
  });

  itWithDatabase(
    'GET /auth/github/callback completes sign-in for a new user',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      const response = await completeGithubCallback(agent);

      expect(response.headers.location).toBe(
        `${APP_ORIGIN}/#/auth/callback?new=true`,
      );

      const cookieHeader = response.headers['set-cookie'];
      const cookieValues = Array.isArray(cookieHeader)
        ? cookieHeader.join('; ')
        : String(cookieHeader ?? '');
      expect(cookieValues).toContain(`${SESSION_COOKIE}=`);
      expect(cookieValues).toMatch(/httponly/i);

      const prisma = app.get(PrismaService);
      const user = await prisma.user.findUnique({
        where: { email: E2E_GITHUB_EMAIL },
        include: { oauthAccounts: true },
      });

      expect(user).not.toBeNull();
      expect(user?.displayName).toBe('E2E User');
      expect(user?.oauthAccounts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            provider: 'GITHUB',
            providerId: E2E_GITHUB_PROVIDER_ID,
            providerEmail: E2E_GITHUB_EMAIL,
          }),
        ]),
      );
    },
  );

  itWithDatabase(
    'GET /auth/github/callback redirects with new=false for returning users',
    async () => {
      const prisma = app.get(PrismaService);
      await prisma.user.create({
        data: {
          email: E2E_GITHUB_EMAIL,
          displayName: 'E2E User',
          oauthAccounts: {
            create: {
              provider: 'GITHUB',
              providerId: E2E_GITHUB_PROVIDER_ID,
              providerEmail: E2E_GITHUB_EMAIL,
            },
          },
        },
      });

      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      const response = await completeGithubCallback(agent);

      expect(response.headers.location).toBe(
        `${APP_ORIGIN}/#/auth/callback?new=false`,
      );
    },
  );

  itWithDatabase(
    'GET /auth/github/callback does not create duplicate rows on re-authentication',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      jest.restoreAllMocks();
      mockGithubProfileFetch();

      const response = await completeGithubCallback(agent);

      expect(response.headers.location).toBe(
        `${APP_ORIGIN}/#/auth/callback?new=false`,
      );

      const prisma = app.get(PrismaService);
      expect(
        await prisma.user.count({ where: { email: E2E_GITHUB_EMAIL } }),
      ).toBe(1);
      expect(
        await prisma.oAuthAccount.count({
          where: { providerId: E2E_GITHUB_PROVIDER_ID },
        }),
      ).toBe(1);
    },
  );

  itWithDatabase(
    'GET /auth/github/callback links OAuth account to existing user by email',
    async () => {
      const prisma = app.get(PrismaService);
      const existingUser = await prisma.user.create({
        data: {
          email: E2E_GITHUB_EMAIL,
          displayName: 'Existing User',
        },
      });

      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      const response = await completeGithubCallback(agent);

      expect(response.headers.location).toBe(
        `${APP_ORIGIN}/#/auth/callback?new=false`,
      );

      const linkedUser = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: { oauthAccounts: true },
      });

      expect(linkedUser?.oauthAccounts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            provider: 'GITHUB',
            providerId: E2E_GITHUB_PROVIDER_ID,
            providerEmail: E2E_GITHUB_EMAIL,
          }),
        ]),
      );
      expect(
        await prisma.user.count({ where: { email: E2E_GITHUB_EMAIL } }),
      ).toBe(1);
    },
  );

  itWithDatabase(
    'GET /auth/github/callback responds within NFR-AUTH-003 baseline (500ms)',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await agent.get('/auth/github').expect(302);

      const startedAt = Date.now();
      await agent
        .get('/auth/github/callback')
        .query({ code: 'test-code', state: 'e2e-test-state' })
        .expect(302);
      const elapsedMs = Date.now() - startedAt;

      expect(elapsedMs).toBeLessThan(NFR_AUTH_CALLBACK_MAX_MS);
    },
  );

  it('POST /auth/logout clears the session cookie', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = app.get(JwtService).sign({ sub: 'logout-user' });

    const response = await agent
      .post('/auth/logout')
      .set('Cookie', `${SESSION_COOKIE}=${token}`)
      .expect(204);

    const cookieHeader = response.headers['set-cookie'];
    const cookieValues = Array.isArray(cookieHeader)
      ? cookieHeader.join('; ')
      : String(cookieHeader ?? '');
    expect(cookieValues).toContain(`${SESSION_COOKIE}=`);
  });

  it('GET /user/profile returns 401 without a session cookie', async () => {
    await request(app.getHttpServer()).get('/user/profile').expect(401);
  });

  itWithDatabase(
    'GET /user/profile returns the current user when authenticated',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      const response = await agent.get('/user/profile').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String) as string,
          email: E2E_GITHUB_EMAIL,
          displayName: 'E2E User',
          avatarUrl: null,
          onboardedAt: null,
        }),
      );
    },
  );

  itWithDatabase(
    'POST /user/onboard updates display name and marks the user onboarded',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      const response = await agent
        .post('/user/onboard')
        .send({ displayName: 'E2E Onboarded' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          displayName: 'E2E Onboarded',
          onboardedAt: expect.any(String) as string,
        }),
      );

      const profile = await agent.get('/user/profile').expect(200);

      expect(profile.body).toEqual(
        expect.objectContaining({
          onboardedAt: expect.any(String) as string,
          displayName: 'E2E Onboarded',
        }),
      );
    },
  );

  it('POST /user/onboard returns 401 without a session cookie', async () => {
    await request(app.getHttpServer())
      .post('/user/onboard')
      .send({ displayName: 'E2E User' })
      .expect(401);
  });

  itWithDatabase(
    'POST /user/onboard returns 400 when display name is empty',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      await agent.post('/user/onboard').send({ displayName: '' }).expect(400);
      await agent
        .post('/user/onboard')
        .send({ displayName: '   ' })
        .expect(400);
    },
  );

  itWithDatabase(
    'POST /user/onboard returns 400 when display name exceeds 100 characters',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      await agent
        .post('/user/onboard')
        .send({ displayName: 'a'.repeat(101) })
        .expect(400);
    },
  );

  itWithDatabase(
    'POST /user/onboard trims whitespace from the display name',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      const response = await agent
        .post('/user/onboard')
        .send({ displayName: '  Trimmed Name  ' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          displayName: 'Trimmed Name',
        }),
      );
    },
  );

  itWithDatabase(
    'POST /user/onboard updates display name for already onboarded users',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      await agent
        .post('/user/onboard')
        .send({ displayName: 'First Name' })
        .expect(201);

      const response = await agent
        .post('/user/onboard')
        .send({ displayName: 'Updated Name' })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          displayName: 'Updated Name',
          onboardedAt: expect.any(String) as string,
        }),
      );

      const profile = await agent.get('/user/profile').expect(200);
      expect(profile.body).toEqual(
        expect.objectContaining({
          displayName: 'Updated Name',
        }),
      );
    },
  );

  itWithDatabase(
    'POST /user/onboard returns 400 when display name is missing or not a string',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      await agent.post('/user/onboard').send({}).expect(400);
      await agent.post('/user/onboard').send({ displayName: 123 }).expect(400);
    },
  );

  itWithDatabase(
    'GET /user/profile sets Cache-Control to no-store',
    async () => {
      mockGithubProfileFetch();

      const agent = request.agent(app.getHttpServer());
      await completeGithubCallback(agent);

      const response = await agent.get('/user/profile').expect(200);

      expect(response.headers['cache-control']).toBe('no-store');
    },
  );

  it('POST /auth/logout returns 204 without a session cookie', async () => {
    await request(app.getHttpServer()).post('/auth/logout').expect(204);
  });
});
