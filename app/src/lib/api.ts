import axios, { isAxiosError } from 'axios'

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

export type OnboardRequest = {
  displayName: string
}

const AUTH_PATH_PREFIXES = ['/auth/', '/user/profile']

function isAuthSessionRequest(url: string | undefined): boolean {
  if (!url) {
    return false
  }

  return AUTH_PATH_PREFIXES.some((prefix) => url.includes(prefix))
}

let sessionExpiredHandler: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !isAuthSessionRequest(error.config?.url)
    ) {
      sessionExpiredHandler?.()
    }

    return Promise.reject(error)
  },
)

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health', {
    validateStatus: (status) => status === 200 || status === 503,
  })
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/user/profile', {
    // Prevent the browser from serving a cached 304 with an empty body, which
    // breaks session restoration and causes auth/onboarding redirect loops.
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })
  return data
}

export async function onboardUser(body: OnboardRequest): Promise<MeResponse> {
  const { data } = await api.post<MeResponse>('/user/onboard', body)
  return data
}

export async function postLogout(): Promise<void> {
  await api.post('/auth/logout')
}

export type RoadmapCatalogTag = {
  slug: string
  name: string
}

export type RoadmapCatalogItem = {
  id: string
  slug: string
  title: string
  description: string | null
  tags: RoadmapCatalogTag[]
  topicCount: number
  isEnrolled: boolean
}

export type ListRoadmapsResponse = {
  items: RoadmapCatalogItem[]
}

export type GetRoadmapsParams = {
  search?: string
  /** Tag slugs; sent as a comma-separated `tags` query param (OR match). */
  tags?: string[]
}

export async function getRoadmaps(
  params: GetRoadmapsParams = {},
): Promise<ListRoadmapsResponse> {
  const query: Record<string, string> = {}
  const search = params.search?.trim()
  if (search) {
    query.search = search
  }
  if (params.tags && params.tags.length > 0) {
    query.tags = params.tags.join(',')
  }

  const { data } = await api.get<ListRoadmapsResponse>('/roadmaps', {
    params: query,
  })
  return data
}

/** Full-page OAuth start URL (not for axios — browser must follow redirects). */
export function getGithubAuthUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
  return `${base}/auth/github`
}
