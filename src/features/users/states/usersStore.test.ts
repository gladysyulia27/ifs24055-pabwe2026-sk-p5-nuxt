import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockPinia } from '../../../test-utils'
import * as userApi from '../api/userApi'
import { useUsersStore } from './usersStore'

vi.mock('../api/userApi')

const user = { id: 1, name: 'A', email: 'a@b.c', email_verified_at: null, created_at: '', updated_at: '' }
const ok = <T>(data: T) => ({ status: 'success', message: '', data })

describe('usersStore', () => {
  beforeEach(() => createMockPinia())

  it('fetchUsers sukses dan gagal', async () => {
    const store = useUsersStore()
    vi.mocked(userApi.getUsers).mockResolvedValue(ok({ users: [user] }))
    expect(await store.fetchUsers()).toBe(true)
    expect(store.users).toEqual([user])
    vi.mocked(userApi.getUsers).mockRejectedValue(new Error('gagal'))
    expect(await store.fetchUsers()).toBe(false)
    expect(store.error).toBe('gagal')
    expect(store.isLoading).toBe(false)
  })

  it('fetchProfile & updateProfile', async () => {
    const store = useUsersStore()
    vi.mocked(userApi.getMe).mockResolvedValue(ok({ user }))
    await store.fetchProfile()
    expect(store.profile).toEqual(user)
    vi.mocked(userApi.updateMe).mockResolvedValue(ok({ user: { ...user, name: 'B' } }))
    expect(await store.updateProfile({ name: 'B', email: 'a@b.c' })).toBe(true)
    expect(store.profile?.name).toBe('B')
    expect(store.isSaving).toBe(false)
  })

  it('uploadPhoto memuat ulang profil', async () => {
    const store = useUsersStore()
    vi.mocked(userApi.uploadPhoto).mockResolvedValue(ok(null))
    vi.mocked(userApi.getMe).mockResolvedValue(ok({ user: { ...user, photo: 'img/a.png' } }))
    expect(await store.uploadPhoto(new File(['x'], 'a.png'))).toBe(true)
    expect(store.profile?.photo).toBe('img/a.png')
  })

  it('changePassword sukses dan gagal', async () => {
    const store = useUsersStore()
    const payload = { password: 'a', new_password: 'b', new_password_confirmation: 'b' }
    vi.mocked(userApi.changePassword).mockResolvedValue(ok(null))
    expect(await store.changePassword(payload)).toBe(true)
    vi.mocked(userApi.changePassword).mockRejectedValue(new Error('salah'))
    expect(await store.changePassword(payload)).toBe(false)
    expect(store.error).toBe('salah')
  })

  it('reset mengosongkan state', () => {
    const store = useUsersStore()
    store.users = [user]
    store.profile = user
    store.error = 'x'
    store.reset()
    expect(store.users).toEqual([])
    expect(store.profile).toBeNull()
    expect(store.error).toBeNull()
  })
})
