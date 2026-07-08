export function generateState(): string {
  return 'e2e-test-state';
}

export function generateCodeVerifier(): string {
  return 'e2e-test-code-verifier';
}

export class GitHub {
  createAuthorizationURL(
    _state: string,
    _scopes: string[],
  ): URL {
    return new URL('https://github.com/login/oauth/authorize');
  }

  async validateAuthorizationCode(
    _code: string,
  ): Promise<{ accessToken: () => string }> {
    return { accessToken: () => 'e2e-test-token' };
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
