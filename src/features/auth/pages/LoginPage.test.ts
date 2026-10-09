import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorDialog } from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import { useAuthStore } from '../states/authStore'
import LoginPage from './LoginPage.vue'

vi.mock('../../../helpers/toolsHelper')

describe('LoginPage', () => {
  beforeEach(() => vi.mocked(showErrorDialog).mockResolvedValue())

  async function fill(wrapper: Awaited<ReturnType<typeof renderWithProviders>>['wrapper'], email = 'a@b.c', password = 'secret') {
    await wrapper.find('#email').setValue(email)
    await wrapper.find('#password').setValue(password)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  it('menampilkan validasi bila form kosong', async () => {
    const { wrapper } = await renderWithProviders(LoginPage)
    await fill(wrapper, '', '')
    expect(wrapper.text()).toContain('wajib diisi')
  })

  it('login sukses menuju beranda', async () => {
    const { wrapper, router, pinia } = await renderWithProviders(LoginPage, { route: '/auth/login' })
    const store = useAuthStore(pinia)
    store.login = vi.fn().mockResolvedValue(true)
    await fill(wrapper)
    expect(store.login).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret' })
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('login gagal menampilkan dialog error', async () => {
    const { wrapper, pinia } = await renderWithProviders(LoginPage)
    const store = useAuthStore(pinia)
    store.login = vi.fn().mockImplementation(async () => {
      store.error = 'Kredensial akun tidak ditemukan'
      return false
    })
    await fill(wrapper)
    expect(showErrorDialog).toHaveBeenCalledWith('Kredensial akun tidak ditemukan', 'Login Gagal')
  })

  it('menangani error null dan menampilkan status loading', async () => {
    const { wrapper, pinia } = await renderWithProviders(LoginPage)
    const store = useAuthStore(pinia)
    store.login = vi.fn().mockResolvedValue(false)
    await fill(wrapper)
    expect(showErrorDialog).toHaveBeenCalledWith('', 'Login Gagal')
    store.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Memproses')
  })
})
