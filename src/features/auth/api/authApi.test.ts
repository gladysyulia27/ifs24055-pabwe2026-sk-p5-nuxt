import { describe, expect, it, vi } from 'vitest'
import * as apiHelper from '../../../helpers/apiHelper'
import { login, register } from './authApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiFetch: vi.fn().mockResolvedValue({ data: 1 }) }))

describe('authApi', () => {
  it('login memanggil POST /auth/login tanpa auth', async () => {
    const payload = { email: 'a@b.c', password: '123456' }
    await login(payload)
    expect(apiHelper.apiFetch).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: payload, auth: false })
  })

  it('register memanggil POST /auth/register tanpa auth', async () => {
    const payload = { name: 'A', email: 'a@b.c', password: '123456' }
    await register(payload)
    expect(apiHelper.apiFetch).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: payload, auth: false })
  })
})
