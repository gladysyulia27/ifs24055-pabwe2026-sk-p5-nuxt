import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'
import { createMockPinia } from '../../../test-utils'
import * as authApi from '../api/authApi'
import { useAuthStore } from './authStore'

vi.mock('../api/authApi')

const user = { id: 1, name: 'Delcom', email: 'd@delcom.org', email_verified_at: null, created_at: '', updated_at: '' }

describe('authStore', () => {
  beforeEach(() => createMockPinia())

  it('state awal membaca token dari penyimpanan', () => {
    putAccessToken('saved')
    const store = useAuthStore()
    expect(store.token).toBe('saved')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login sukses menyimpan token dan user', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ status: 'success', message: '', data: { user, token: 'tok' } })
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(await store.login({ email: 'a', password: 'b' })).toBe(true)
    expect(store.token).toBe('tok')
    expect(store.user).toEqual(user)
    expect(getAccessToken()).toBe('tok')
    expect(store.isLoading).toBe(false)
  })

  it('login gagal menyimpan pesan error', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Kredensial salah'))
    const store = useAuthStore()
    expect(await store.login({ email: 'a', password: 'b' })).toBe(false)
    expect(store.error).toBe('Kredensial salah')
    expect(store.isAuthenticated).toBe(false)
  })

  it('register sukses dan gagal', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.register).mockResolvedValue({ status: 'success', message: '', data: null })
    expect(await store.register({ name: 'a', email: 'b', password: 'c' })).toBe(true)
    vi.mocked(authApi.register).mockRejectedValue(new Error('Email sudah dipakai'))
    expect(await store.register({ name: 'a', email: 'b', password: 'c' })).toBe(false)
    expect(store.error).toBe('Email sudah dipakai')
  })

  it('logout membersihkan sesi', () => {
    putAccessToken('tok')
    const store = useAuthStore()
    store.user = user
    store.error = 'x'
    store.logout()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.error).toBeNull()
    expect(getAccessToken()).toBeNull()
  })
})
