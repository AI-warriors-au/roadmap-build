import { ConfigService } from '@nestjs/config';
import { GitHub, Google } from 'arctic';

function requireConfig(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
}

export function createGoogleProvider(config: ConfigService): Google {
  return new Google(
    requireConfig(config, 'GOOGLE_CLIENT_ID'),
    requireConfig(config, 'GOOGLE_CLIENT_SECRET'),
    requireConfig(config, 'GOOGLE_REDIRECT_URI'),
  );
}

export function createGithubProvider(config: ConfigService): GitHub {
  return new GitHub(
    requireConfig(config, 'GITHUB_CLIENT_ID'),
    requireConfig(config, 'GITHUB_CLIENT_SECRET'),
    requireConfig(config, 'GITHUB_REDIRECT_URI'),
  );
}

export const GOOGLE_OAUTH = 'GOOGLE_OAUTH';
export const GITHUB_OAUTH = 'GITHUB_OAUTH';
