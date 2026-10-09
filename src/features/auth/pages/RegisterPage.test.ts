import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import { useAuthStore } from '../states/authStore'
import RegisterPage from './RegisterPage.vue'

vi.mock('../../../helpers/toolsHelper')

type Wrapper = Awaited<ReturnType<typeof renderWithProviders>>['wrapper']

async function fill(wrapper: Wrapper, name = 'Delcom', email = 'a@b.c', password = 'secret1') {
  await wrapper.find('#name').setValue(name)
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(showErrorDialog).mockResolvedValue()
    vi.mocked(showSuccessDialog).mockResolvedValue()
  })

  it('validasi field kosong dan password pendek', async () => {
    const { wrapper } = await renderWithProviders(RegisterPage)
    await fill(wrapper, '', '', '')
    expect(wrapper.text()).toContain('wajib diisi')
    await fill(wrapper, 'A', 'a@b.c', '123')
    expect(wrapper.text()).toContain('minimal 6 karakter')
  })

  it('register sukses menuju login', async () => {
    const { wrapper, router, pinia } = await renderWithProviders(RegisterPage)
    const store = useAuthStore(pinia)
    store.register = vi.fn().mockResolvedValue(true)
    await fill(wrapper)
    expect(store.register).toHaveBeenCalledWith({ name: 'Delcom', email: 'a@b.c', password: 'secret1' })
    expect(showSuccessDialog).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('register gagal menampilkan dialog error', async () => {
    const { wrapper, pinia } = await renderWithProviders(RegisterPage)
    const store = useAuthStore(pinia)
    store.register = vi.fn().mockImplementation(async () => {
      store.error = 'Email sudah terdaftar'
      return false
    })
    await fill(wrapper)
    expect(showErrorDialog).toHaveBeenCalledWith('Email sudah terdaftar', 'Pendaftaran Gagal')
    store.error = null
    store.register = vi.fn().mockResolvedValue(false)
    await fill(wrapper)
    expect(showErrorDialog).toHaveBeenLastCalledWith('', 'Pendaftaran Gagal')
    store.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Memproses')
  })
})
