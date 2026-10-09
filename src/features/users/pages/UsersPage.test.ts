import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test-utils'
import { useUsersStore } from '../states/usersStore'
import UsersPage from './UsersPage.vue'

vi.mock('../api/userApi')
import * as userApi from '../api/userApi'

const base = { email_verified_at: null, created_at: '2024-10-05T03:26:57.000000Z', updated_at: '' }
const users = [
  { ...base, id: 1, name: 'Delcom Testing', email: 'testing@delcom.org', photo: 'https://x.test/a.png' },
  { ...base, id: 2, name: 'Abdullah Ubaid', email: 'ifs18005@delcom.org', photo: null },
]

describe('UsersPage', () => {
  it('menampilkan daftar pengguna dan memfilter dengan kata kunci', async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue({ status: 'success', message: '', data: { users } })
    const { wrapper } = await renderWithProviders(UsersPage)
    await flushPromises()
    expect(wrapper.findAll('[data-testid="user-item"]')).toHaveLength(2)
    expect(wrapper.find('img').attributes('src')).toBe('https://x.test/a.png')
    expect(wrapper.text()).toContain('AU')

    await wrapper.find('input[type="search"]').setValue('abdullah')
    expect(wrapper.findAll('[data-testid="user-item"]')).toHaveLength(1)
    await wrapper.find('input[type="search"]').setValue('tidak-ada')
    expect(wrapper.text()).toContain('Tidak ada pengguna')
  })

  it('menampilkan loading dan error', async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue({ status: 'success', message: '', data: { users: [] } })
    const { wrapper, pinia } = await renderWithProviders(UsersPage)
    await flushPromises()
    const store = useUsersStore(pinia)
    store.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Memuat pengguna')
    store.isLoading = false
    store.error = 'Gagal memuat'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="alert"]').text()).toBe('Gagal memuat')
  })
})
