export const DISPLAY_NAME_MAX_LENGTH = 80

/**
 * Derives avatar initials from a display name: the first character of the first
 * two whitespace-separated tokens, uppercased. Falls back to a single character
 * for one-word names and a neutral placeholder for empty names.
 */
export function getInitials(displayName: string): string {
  const tokens = displayName.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return '?'
  }
  if (tokens.length === 1) {
    return tokens[0]!.charAt(0).toUpperCase()
  }
  return (tokens[0]!.charAt(0) + tokens[1]!.charAt(0)).toUpperCase()
}

/**
 * Client-side validation for the editable display name. Mirrors the server DTO
 * bounds (required, non-empty when trimmed, max length). Returns an error
 * message or null when valid.
 */
export function validateDisplayName(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return 'Display name is required.'
  }
  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`
  }
  return null
}
