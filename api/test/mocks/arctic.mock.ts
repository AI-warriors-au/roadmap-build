export function generateState(): string {
  return 'e2e-test-state';
}

export function generateCodeVerifier(): string {
  return 'e2e-test-code-verifier';
}

export class GitHub {
  createAuthorizationURL(state: string, scopes: string[]): URL {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('state', state);
    url.searchParams.set('scope', scopes.join(' '));
    return url;
  }

  validateAuthorizationCode(
    code: string,
  ): Promise<{ accessToken: () => string }> {
    void code;
    return Promise.resolve({ accessToken: () => 'e2e-test-token' });
  }
}

export class OAuth2RequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly description: string,
  ) {
    super(description);
    this.name = 'OAuth2RequestError';
  }
}
