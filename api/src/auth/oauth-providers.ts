import { ConfigService } from '@nestjs/config';
import { GitHub } from 'arctic';

// Google OAuth is disabled until a Google Cloud OAuth app is available.
// export function createGoogleProvider(config: ConfigService): Google {
//   return new Google(
//     requireConfig(config, 'ROADMAP_GOOGLE_CLIENT_ID'),
//     requireConfig(config, 'ROADMAP_GOOGLE_CLIENT_SECRET'),
//     requireConfig(config, 'ROADMAP_GOOGLE_REDIRECT_URI'),
//   );
// }

export function createGithubProvider(config: ConfigService): GitHub | null {
  const clientId = config.get<string>('ROADMAP_GITHUB_CLIENT_ID');
  const clientSecret = config.get<string>('ROADMAP_GITHUB_CLIENT_SECRET');
  const redirectUri = config.get<string>('ROADMAP_GITHUB_REDIRECT_URI');

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return new GitHub(clientId, clientSecret, redirectUri);
}

export const GITHUB_OAUTH = 'GITHUB_OAUTH';
