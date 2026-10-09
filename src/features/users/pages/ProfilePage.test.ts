import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import * as userApi from '../api/userApi'
import { useUsersStore } from '../states/usersStore'
import ProfilePage from './ProfilePage.vue'

vi.mock('../api/userApi')
vi.mock('../../../helpers/toolsHelper', async (orig) => ({
  ...(await orig<typeof import('../../../helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const user = { id: 1, name: 'Delcom Testing', email: 'testing@delcom.org', email_verified_at: null, created_at: '', updated_at: '', photo: 'img/profile/1.png' }
const ok = <T>(data: T) => ({ status: 'success', message: '', data })

async function setup(profile: typeof user | null = user) {
  vi.mocked(userApi.getMe).mockResolvedValue(ok({ user: profile ?? user }))
  const result = await renderWithProviders(ProfilePage, { initialState: profile ? { users: { users: [], profile, isLoading: false, isSaving: false, error: null } } : {} })
  await flushPromises()
  return result
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.mocked(showErrorDialog).mockResolvedValue()
    vi.mocked(showSuccessDialog).mockResolvedValue()
  })

  it('mengisi form dari profil dan menampilkan foto / inisial', async () => {
    const { wrapper, pinia } = await setup()
    expect((wrapper.find('#profile-name').element as HTMLInputElement).value).toBe('Delcom Testing')
    expect(wrapper.find('img').attributes('src')).toBe('https://open-api.delcom.org/img/profile/1.png')
    useUsersStore(pinia).profile = { ...user, photo: null }
    await wrapper.vm.$nextTick()
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('DT')
  })

  it('tidak mengisi form bila profil belum ada', async () => {
    vi.mocked(userApi.getMe).mockRejectedValue(new Error('x'))
    const { wrapper } = await renderWithProviders(ProfilePage)
    await flushPromises()
    expect((wrapper.find('#profile-name').element as HTMLInputElement).value).toBe('')
  })

  it('memperbarui profil: sukses dan gagal', async () => {
    const { wrapper } = await setup()
    vi.mocked(userApi.updateMe).mockResolvedValue(ok({ user: { ...user, name: 'Baru' } }))
    await wrapper.find('#profile-name').setValue(' Baru ')
    await wrapper.find('#profile-email').setValue('baru@delcom.org')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(userApi.updateMe).toHaveBeenCalledWith({ name: 'Baru', email: 'baru@delcom.org' })
    expect(showSuccessDialog).toHaveBeenCalledWith('Profil berhasil diperbarui.')

    vi.mocked(userApi.updateMe).mockRejectedValue(new Error('Email dipakai'))
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Email dipakai')
  })

  it('mengunggah foto: tanpa file, sukses, gagal', async () => {
    const { wrapper, pinia } = await setup()
    const store = useUsersStore(pinia)
    const input = wrapper.find('input[type="file"]')
    const button = wrapper.find('button[type="button"]')
    expect(button.attributes('disabled')).toBeDefined()

    const pick = async (files: File[]) => {
      Object.defineProperty(input.element, 'files', { value: files, configurable: true })
      await input.trigger('change')
    }
    await pick([])
    expect(button.attributes('disabled')).toBeDefined()

    await pick([new File(['x'], 'a.png')])
    vi.mocked(userApi.uploadPhoto).mockResolvedValue(ok(null))
    await button.trigger('click')
    await flushPromises()
    expect(showSuccessDialog).toHaveBeenCalledWith('Foto profil berhasil diperbarui.')
    expect(store.isSaving).toBe(false)

    await pick([new File(['x'], 'b.png')])
    vi.mocked(userApi.uploadPhoto).mockRejectedValue(new Error('Terlalu besar'))
    await button.trigger('click')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Terlalu besar')
  })

  it('mengubah password: validasi, sukses, gagal', async () => {
    const { wrapper } = await setup()
    const submit = async () => {
      await wrapper.findAll('form')[1].trigger('submit')
      await flushPromises()
    }
    await submit()
    expect(wrapper.text()).toContain('wajib diisi')

    await wrapper.find('#current-password').setValue('lama')
    await wrapper.find('#new-password').setValue('baru12')
    await wrapper.find('#confirm-password').setValue('beda')
    await submit()
    expect(wrapper.text()).toContain('tidak cocok')

    await wrapper.find('#confirm-password').setValue('baru12')
    vi.mocked(userApi.changePassword).mockResolvedValue(ok(null))
    await submit()
    expect(userApi.changePassword).toHaveBeenCalledWith({ password: 'lama', new_password: 'baru12', new_password_confirmation: 'baru12' })
    expect(showSuccessDialog).toHaveBeenCalledWith('Kata sandi berhasil diubah.')
    expect((wrapper.find('#current-password').element as HTMLInputElement).value).toBe('')

    await wrapper.find('#current-password').setValue('lama')
    await wrapper.find('#new-password').setValue('baru12')
    await wrapper.find('#confirm-password').setValue('baru12')
    vi.mocked(userApi.changePassword).mockRejectedValue(new Error('Password salah'))
    await submit()
    expect(showErrorDialog).toHaveBeenCalledWith('Password salah')
  })
})
