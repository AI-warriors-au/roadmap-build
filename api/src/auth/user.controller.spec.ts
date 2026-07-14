import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { UserController } from './user.controller';

jest.mock('arctic', () => ({
  generateState: jest.fn(() => 'generated-state'),
}));

describe('UserController', () => {
  let controller: UserController;
  let authService: { getCurrentUser: jest.Mock; onboardUser: jest.Mock };

  beforeEach(async () => {
    authService = {
      getCurrentUser: jest.fn(),
      onboardUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(UserController);
  });

  it('GET /user/profile returns the current user from the session', async () => {
    const profile = {
      id: 'user-1',
      email: 'a@b.com',
      displayName: 'Ada',
      avatarUrl: null,
      onboardedAt: null,
    };
    authService.getCurrentUser.mockResolvedValue(profile);

    await expect(
      controller.profile({ user: { id: 'user-1' } } as Request),
    ).resolves.toEqual(profile);
    expect(authService.getCurrentUser).toHaveBeenCalledWith('user-1');
  });

  it('POST /user/onboard confirms display name and marks the user onboarded', async () => {
    const profile = {
      id: 'user-1',
      email: 'a@b.com',
      displayName: 'Ada Lovelace',
      avatarUrl: null,
      onboardedAt: '2026-01-15T00:00:00.000Z',
    };
    authService.onboardUser = jest.fn().mockResolvedValue(profile);

    await expect(
      controller.onboard({ user: { id: 'user-1' } } as Request, 'Ada Lovelace'),
    ).resolves.toEqual(profile);
    expect(authService.onboardUser).toHaveBeenCalledWith(
      'user-1',
      'Ada Lovelace',
    );
  });

  it('propagates UnauthorizedException from the service', async () => {
    authService.getCurrentUser.mockRejectedValue(new UnauthorizedException());

    await expect(
      controller.profile({ user: { id: 'missing' } } as Request),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
