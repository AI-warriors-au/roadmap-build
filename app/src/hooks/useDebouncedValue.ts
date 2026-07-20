import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has stayed unchanged for `delayMs`.
 * Used for catalog search (NFR-CAT-002: 300ms).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [value, delayMs])

  return debounced
}
