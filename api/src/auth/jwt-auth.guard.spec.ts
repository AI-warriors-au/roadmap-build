import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_COOKIE } from './auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let jwt: { verify: jest.Mock };

  const executionContext = (
    cookies: Record<string, string> = {},
  ): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ cookies }) as Request,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    jwt = {
      verify: jest.fn(),
    };

    guard = new JwtAuthGuard(
      reflector as unknown as Reflector,
      jwt as unknown as JwtService,
    );
  });

  it('allows public routes without a session cookie', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(executionContext())).toBe(true);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('throws 401 when the session cookie is missing', () => {
    expect(() => guard.canActivate(executionContext())).toThrow(
      UnauthorizedException,
    );
  });

  it('throws 401 when the session token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    expect(() =>
      guard.canActivate(executionContext({ [SESSION_COOKIE]: 'bad-token' })),
    ).toThrow(UnauthorizedException);
  });

  it('throws 401 when the session token is expired', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    expect(() =>
      guard.canActivate(
        executionContext({ [SESSION_COOKIE]: 'expired-token' }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('attaches the authenticated user and allows the request when the token is valid', () => {
    jwt.verify.mockReturnValue({ sub: 'user-123' });
    const request = { cookies: { [SESSION_COOKIE]: 'valid-token' } } as Request;

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'user-123' });
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
