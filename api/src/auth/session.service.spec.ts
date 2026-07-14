import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { SESSION_COOKIE } from './auth.types';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let jwt: { sign: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(() => {
    jwt = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
    };
    config = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'JWT_EXPIRES_IN') return '7d';
        return undefined;
      }),
    };

    service = new SessionService(
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  it('sets an httpOnly SameSite=Lax session cookie on createSession', () => {
    const cookie = jest.fn();
    const res = { cookie, clearCookie: jest.fn() } as unknown as Response;

    service.createSession('user-1', res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 'user-1' },
      { expiresIn: '7d' },
    );
    expect(cookie).toHaveBeenCalledWith(
      SESSION_COOKIE,
      'signed-jwt',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      }),
    );
  });

  it('sets secure SameSite=None cookies in production for cross-origin SPA auth', () => {
    config.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'production';
      if (key === 'JWT_EXPIRES_IN') return '7d';
      return undefined;
    });

    const cookie = jest.fn();
    const res = { cookie, clearCookie: jest.fn() } as unknown as Response;

    service.createSession('user-1', res);

    expect(cookie).toHaveBeenCalledWith(
      SESSION_COOKIE,
      'signed-jwt',
      expect.objectContaining({
        secure: true,
        sameSite: 'none',
      }),
    );
  });

  it('clears the session cookie on clearSession', () => {
    const clearCookie = jest.fn();
    const res = { cookie: jest.fn(), clearCookie } as unknown as Response;

    service.clearSession(res);

    expect(clearCookie).toHaveBeenCalledWith(
      SESSION_COOKIE,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });

  it('uses the same duration parser as JWT for cookie maxAge', () => {
    config.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      if (key === 'JWT_EXPIRES_IN') return '2 days';
      return undefined;
    });

    const cookie = jest.fn();
    const res = { cookie, clearCookie: jest.fn() } as unknown as Response;

    service.createSession('user-1', res);

    expect(cookie).toHaveBeenCalledWith(
      SESSION_COOKIE,
      'signed-jwt',
      expect.objectContaining({
        maxAge: 2 * 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('throws when JWT_EXPIRES_IN is invalid', () => {
    config.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      if (key === 'JWT_EXPIRES_IN') return 'not-a-duration';
      return undefined;
    });

    const cookie = jest.fn();
    const res = {
      cookie,
      clearCookie: jest.fn(),
    } as unknown as Response;

    expect(() => service.createSession('user-1', res)).toThrow(
      'Invalid JWT_EXPIRES_IN: not-a-duration',
    );
    expect(cookie).not.toHaveBeenCalled();
  });
});
