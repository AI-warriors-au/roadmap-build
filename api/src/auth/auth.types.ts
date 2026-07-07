import type { OAuthProvider } from '@prisma/client';

export interface ProviderProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export const OAUTH_STATE_COOKIE = 'oauth_state';
export const OAUTH_CODE_VERIFIER_COOKIE = 'oauth_code_verifier';
export const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;
