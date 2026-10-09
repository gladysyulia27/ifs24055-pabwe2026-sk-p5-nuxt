import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError, apiFetch, buildUrl, flattenMessages, getAccessToken, getErrorMessage, putAccessToken, resolveAssetUrl,
} from './apiHelper'

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response)

describe('apiHelper', () => {
  const fetchMock = vi.fn()
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))
  afterEach(() => vi.unstubAllGlobals())

  describe('token', () => {
    it('menyimpan, membaca, dan menghapus token', () => {
      expect(getAccessToken()).toBeNull()
      putAccessToken('abc')
      expect(getAccessToken()).toBe('abc')
      putAccessToken(null)
      expect(getAccessToken()).toBeNull()
    })
  })

  describe('buildUrl', () => {
    it('menggabungkan base url dan query, mengabaikan nilai kosong', () => {
      expect(buildUrl('/a')).toBe('https://open-api.delcom.org/api/v1/a')
      expect(buildUrl('/a', { x: 1, y: '', z: undefined, w: null, v: 'ok' })).toBe(
        'https://open-api.delcom.org/api/v1/a?x=1&v=ok',
      )
      expect(buildUrl('/a', { y: '' })).toBe('https://open-api.delcom.org/api/v1/a')
    })
  })

  describe('apiFetch', () => {
    it('mengirim GET dengan Bearer token', async () => {
      putAccessToken('tok')
      fetchMock.mockReturnValue(jsonResponse({ status: 'success', message: 'ok', data: { a: 1 } }))
      const res = await apiFetch('/users', { query: { q: 'x' } })
      expect(res.data).toEqual({ a: 1 })
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toContain('/users?q=x')
      expect(init.method).toBe('GET')
      expect(init.headers.Authorization).toBe('Bearer tok')
      expect(init.body).toBeUndefined()
    })

    it('tidak mengirim Authorization bila auth=false atau token kosong', async () => {
      putAccessToken('tok')
      fetchMock.mockReturnValue(jsonResponse({ status: 'success', message: 'ok', data: null }))
      await apiFetch('/auth/login', { method: 'POST', body: { a: 1 }, auth: false })
      const init = fetchMock.mock.calls[0][1]
      expect(init.headers.Authorization).toBeUndefined()
      expect(init.headers['Content-Type']).toBe('application/json')
      expect(init.body).toBe('{"a":1}')

      putAccessToken(null)
      await apiFetch('/users')
      expect(fetchMock.mock.calls[1][1].headers.Authorization).toBeUndefined()
    })

    it('mengirim FormData tanpa Content-Type manual', async () => {
      fetchMock.mockReturnValue(jsonResponse({ status: 'success', message: 'ok', data: null }))
      const form = new FormData()
      await apiFetch('/users/me/photo', { method: 'POST', body: form })
      const init = fetchMock.mock.calls[0][1]
      expect(init.body).toBe(form)
      expect(init.headers['Content-Type']).toBeUndefined()
    })

    it('melempar ApiError saat respons gagal', async () => {
      fetchMock.mockReturnValue(jsonResponse({ status: 'fail', message: 'Data tidak valid', data: { email: ['wajib'] } }, 422))
      await expect(apiFetch('/x')).rejects.toMatchObject({ name: 'ApiError', message: 'Data tidak valid', status: 422, data: { email: ['wajib'] } })
    })

    it('memakai pesan default bila server tidak memberi pesan / JSON tidak valid', async () => {
      fetchMock.mockReturnValue(jsonResponse({ status: 'fail' }, 500))
      await expect(apiFetch('/x')).rejects.toThrow('Terjadi kesalahan pada server')
      fetchMock.mockReturnValue(
        Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new Error('bad')) } as Response),
      )
      await expect(apiFetch('/x')).rejects.toThrow('Terjadi kesalahan pada server')
    })

    it('melempar ApiError saat jaringan gagal', async () => {
      fetchMock.mockRejectedValue(new TypeError('network'))
      const error = await apiFetch('/x').catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.message).toBe('Tidak dapat terhubung ke server')
      expect(error.status).toBe(0)
    })

    it('ApiError memiliki nilai default', () => {
      const error = new ApiError('x')
      expect(error.status).toBe(0)
      expect(error.data).toBeUndefined()
    })
  })

  describe('flattenMessages & getErrorMessage', () => {
    it('meratakan pesan validasi', () => {
      expect(flattenMessages(null)).toEqual([])
      expect(flattenMessages('x')).toEqual([])
      expect(flattenMessages({ a: ['1', 2], b: 'tiga', c: 4 })).toEqual(['1', '2', 'tiga'])
    })

    it('membentuk pesan error dari berbagai jenis error', () => {
      expect(getErrorMessage(new ApiError('Gagal', 422, { a: ['x', 'y'] }))).toBe('Gagal: x, y')
      expect(getErrorMessage(new ApiError('Gagal', 400))).toBe('Gagal')
      expect(getErrorMessage(new Error('boom'))).toBe('boom')
      expect(getErrorMessage('str')).toBe('Terjadi kesalahan tidak terduga')
    })
  })

  describe('resolveAssetUrl', () => {
    it('menangani path kosong, absolut, dan relatif', () => {
      expect(resolveAssetUrl(null)).toBe('')
      expect(resolveAssetUrl(undefined)).toBe('')
      expect(resolveAssetUrl('https://x.test/a.png')).toBe('https://x.test/a.png')
      expect(resolveAssetUrl('/img/a.png')).toBe('https://open-api.delcom.org/img/a.png')
    })
  })
})
