import type { OAuthProvider } from '@prisma/client';

export interface ProviderProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface OAuthUpsertResult {
  userId: string;
  isNewUser: boolean;
}

export const OAUTH_STATE_COOKIE = 'oauth_state';
export const OAUTH_CODE_VERIFIER_COOKIE = 'oauth_code_verifier';
export const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

export const SESSION_COOKIE = 'session';
export const JWT_DEFAULT_EXPIRES_IN = '7d';

export interface AuthenticatedUser {
  id: string;
}

export interface JwtPayload {
  sub: string;
}

/** Minimal current-user payload for GET /user/profile (shared by SPA consumers). */
export interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  onboardedAt: string | null;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
