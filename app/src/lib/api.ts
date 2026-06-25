import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
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
