import { apiFetch } from '../../../helpers/apiHelper'

export interface AuthUser {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  photo?: string | null
  created_at: string
  updated_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginResult {
  user: AuthUser
  token: string
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResult>('/auth/login', { method: 'POST', body: payload, auth: false })
}

export function register(payload: RegisterPayload) {
  return apiFetch<null>('/auth/register', { method: 'POST', body: payload, auth: false })
}
