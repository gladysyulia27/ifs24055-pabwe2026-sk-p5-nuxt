import { apiFetch } from '../../../helpers/apiHelper'
import type { AuthUser } from '../../auth/api/authApi'

export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface ChangePasswordPayload {
  password: string
  new_password: string
  new_password_confirmation: string
}

export function getUsers() {
  return apiFetch<{ users: AuthUser[] }>('/users')
}

export function getMe() {
  return apiFetch<{ user: AuthUser }>('/users/me')
}

export function updateMe(payload: UpdateProfilePayload) {
  return apiFetch<{ user: AuthUser }>('/users/me', { method: 'PUT', body: payload })
}

export function uploadPhoto(file: File) {
  const formData = new FormData()
  formData.append('photo', file)
  return apiFetch<unknown>('/users/me/photo', { method: 'POST', body: formData })
}

// Catatan: dokumentasi Delcom Open API memakai PUT /users/password
export function changePassword(payload: ChangePasswordPayload) {
  return apiFetch<null>('/users/password', { method: 'PUT', body: payload })
}
