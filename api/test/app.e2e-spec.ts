import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { SESSION_COOKIE } from '../src/auth/auth.types';
import { createE2eApp } from './create-e2e-app';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'e2e-jwt-secret';
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET) returns 401 without a session cookie', () => {
    return request(app.getHttpServer()).get('/health').expect(401);
  });

  it('/health (GET) returns health payload with a valid session cookie', async () => {
    const token = app.get(JwtService).sign({ sub: 'health-check-user' });

    await request(app.getHttpServer())
      .get('/health')
      .set('Cookie', `${SESSION_COOKIE}=${token}`)
      .expect((res) => {
        expect([200, 503]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('database');
      });
  });
});
