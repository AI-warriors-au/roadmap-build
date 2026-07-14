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

/** Full-page OAuth start URL (not for axios — browser must follow redirects). */
export function getGithubAuthUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
  return `${base}/auth/github`
}
