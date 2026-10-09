import { describe, expect, it, vi } from 'vitest'
import * as apiHelper from '../../../helpers/apiHelper'
import { changePassword, getMe, getUsers, updateMe, uploadPhoto } from './userApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiFetch: vi.fn().mockResolvedValue({}) }))
const apiFetch = apiHelper.apiFetch as unknown as ReturnType<typeof vi.fn>

describe('userApi', () => {
  it('getUsers & getMe', async () => {
    await getUsers()
    expect(apiFetch).toHaveBeenLastCalledWith('/users')
    await getMe()
    expect(apiFetch).toHaveBeenLastCalledWith('/users/me')
  })

  it('updateMe memakai PUT /users/me', async () => {
    await updateMe({ name: 'A', email: 'a@b.c' })
    expect(apiFetch).toHaveBeenLastCalledWith('/users/me', { method: 'PUT', body: { name: 'A', email: 'a@b.c' } })
  })

  it('uploadPhoto mengirim FormData lewat POST', async () => {
    const file = new File(['x'], 'p.png', { type: 'image/png' })
    await uploadPhoto(file)
    const [path, options] = apiFetch.mock.calls.at(-1)!
    expect(path).toBe('/users/me/photo')
    expect(options.method).toBe('POST')
    expect((options.body as FormData).get('photo')).toBeInstanceOf(File)
  })

  it('changePassword memakai PUT /users/password', async () => {
    const payload = { password: 'a', new_password: 'b', new_password_confirmation: 'b' }
    await changePassword(payload)
    expect(apiFetch).toHaveBeenLastCalledWith('/users/password', { method: 'PUT', body: payload })
  })
})
