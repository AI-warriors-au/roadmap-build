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

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health', {
    validateStatus: (status) => status === 200 || status === 503,
  })
  return data
}
