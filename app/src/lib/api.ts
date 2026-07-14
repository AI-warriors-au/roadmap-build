import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

export type HealthResponse = {
  status: 'ok' | 'unhealthy'
  database: 'connected' | 'disconnected'
}

export type MeResponse = {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  onboardedAt: string | null
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health', {
    validateStatus: (status) => status === 200 || status === 503,
  })
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/user/profile')
  return data
}

export type UpdateProfileInput = {
  displayName: string
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<MeResponse> {
  const { data } = await api.patch<MeResponse>('/user/profile', input)
  return data
}

/** Clears the httpOnly session cookie server-side. */
export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

/** Full-page OAuth start URL (not for axios — browser must follow redirects). */
export function getGithubAuthUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
  return `${base}/auth/github`
}
