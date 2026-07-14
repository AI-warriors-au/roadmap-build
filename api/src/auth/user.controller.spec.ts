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
  let authService: { getCurrentUser: jest.Mock; updateProfile: jest.Mock };

  beforeEach(async () => {
    authService = {
      getCurrentUser: jest.fn(),
      updateProfile: jest.fn(),
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

  it('propagates UnauthorizedException from the service', async () => {
    authService.getCurrentUser.mockRejectedValue(new UnauthorizedException());

    await expect(
      controller.profile({ user: { id: 'missing' } } as Request),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('PATCH /user/profile updates the caller display name', async () => {
    const updated = {
      id: 'user-1',
      email: 'a@b.com',
      displayName: 'Ada Lovelace',
      avatarUrl: null,
      onboardedAt: null,
    };
    authService.updateProfile.mockResolvedValue(updated);

    await expect(
      controller.updateProfile({ user: { id: 'user-1' } } as Request, {
        displayName: 'Ada Lovelace',
      }),
    ).resolves.toEqual(updated);
    expect(authService.updateProfile).toHaveBeenCalledWith('user-1', {
      displayName: 'Ada Lovelace',
    });
  });
});
