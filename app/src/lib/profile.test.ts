import { describe, expect, it } from 'vitest'

import {
  DISPLAY_NAME_MAX_LENGTH,
  getInitials,
  validateDisplayName,
} from './profile'

describe('getInitials', () => {
  it('takes the first letter of the first two tokens', () => {
    expect(getInitials('Sam Rivers')).toBe('SR')
  })

  it('uses a single letter for one-word names', () => {
    expect(getInitials('Ada')).toBe('A')
  })

  it('collapses extra whitespace between tokens', () => {
    expect(getInitials('  Sam   Rivers ')).toBe('SR')
  })

  it('falls back to a placeholder for empty names', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })
})

describe('validateDisplayName', () => {
  // Must mirror the backend PATCH /user/profile DTO: 1–80 characters.
  it('mirrors the server display-name bound of 80 characters', () => {
    expect(DISPLAY_NAME_MAX_LENGTH).toBe(80)
  })

  it('requires a non-empty value (min 1, trimmed)', () => {
    expect(validateDisplayName('')).toMatch(/required/i)
    expect(validateDisplayName('   ')).toMatch(/required/i)
  })

  it('accepts the minimum length (1 character)', () => {
    expect(validateDisplayName('A')).toBeNull()
  })

  it('accepts a name exactly at the 80-character maximum', () => {
    expect(validateDisplayName('a'.repeat(80))).toBeNull()
    expect(
      validateDisplayName('a'.repeat(DISPLAY_NAME_MAX_LENGTH)),
    ).toBeNull()
  })

  it('rejects a name over the 80-character maximum', () => {
    expect(validateDisplayName('a'.repeat(81))).toMatch(
      /characters or fewer/i,
    )
    expect(
      validateDisplayName('a'.repeat(DISPLAY_NAME_MAX_LENGTH + 1)),
    ).toMatch(/characters or fewer/i)
  })

  it('accepts a typical value', () => {
    expect(validateDisplayName('Sam Rivers')).toBeNull()
  })
})
