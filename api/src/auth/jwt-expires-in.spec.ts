import { resolveJwtExpiresIn, jwtExpiresInToMs } from './jwt-expires-in';

describe('jwt-expires-in', () => {
  it('accepts durations supported by ms', () => {
    expect(resolveJwtExpiresIn('7d')).toBe('7d');
    expect(jwtExpiresInToMs('2 days')).toBe(2 * 24 * 60 * 60 * 1000);
  });

  it('throws for invalid JWT_EXPIRES_IN values', () => {
    expect(() => resolveJwtExpiresIn('not-a-duration')).toThrow(
      'Invalid JWT_EXPIRES_IN: not-a-duration',
    );
  });
});
