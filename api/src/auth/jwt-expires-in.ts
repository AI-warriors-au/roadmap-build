import ms, { type StringValue } from 'ms';
import { JWT_DEFAULT_EXPIRES_IN } from './auth.types';

export function resolveJwtExpiresIn(value: string | undefined): StringValue {
  const expiresIn = (value ?? JWT_DEFAULT_EXPIRES_IN) as StringValue;
  const maxAge = ms(expiresIn);

  if (typeof maxAge !== 'number' || maxAge <= 0) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${expiresIn}`);
  }

  return expiresIn;
}

export function jwtExpiresInToMs(value: string | undefined): number {
  return ms(resolveJwtExpiresIn(value));
}
