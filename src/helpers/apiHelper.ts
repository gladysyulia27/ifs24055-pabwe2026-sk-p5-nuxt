export const TOKEN_KEY = 'delcom_access_token'

export interface ApiResponse<T = unknown> {
  status: string
  message: string
  data: T
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status = 0, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  auth?: boolean
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function putAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${DELCOM_BASEURL.replace(/\/+$/, '')}${path}`
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }
  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
}

/** Wrapper fetch REST API dengan Bearer Token dan penanganan error terstandarisasi. */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', query, body, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }

  const token = getAccessToken()
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body: payload })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server', 0)
  }

  const json = (await response.json().catch(() => ({}))) as Partial<ApiResponse<T>>
  if (!response.ok || json.status !== 'success') {
    throw new ApiError(json.message || 'Terjadi kesalahan pada server', response.status, json.data)
  }
  return json as ApiResponse<T>
}

/** Meratakan pesan validasi, mis. { email: ['wajib diisi'] } => ['wajib diisi']. */
export function flattenMessages(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []
  return Object.values(data as Record<string, unknown>).flatMap((value) => {
    if (Array.isArray(value)) return value.map(String)
    return typeof value === 'string' ? [value] : []
  })
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const details = flattenMessages(error.data)
    return details.length ? `${error.message}: ${details.join(', ')}` : error.message
  }
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan tidak terduga'
}

/** Mengubah path aset relatif (mis. img/profile/1.png) menjadi URL absolut. */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\/+/, '')}`
}
