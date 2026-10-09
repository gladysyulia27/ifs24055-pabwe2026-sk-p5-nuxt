import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { putAccessToken } from '../../../helpers/apiHelper'
import { showConfirmDialog } from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import * as userApi from '../../users/api/userApi'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import NavbarComponent from './NavbarComponent.vue'

vi.mock('../../users/api/userApi')
vi.mock('../../../helpers/toolsHelper')

const user = { id: 1, name: 'Delcom Testing', email: 'testing@delcom.org', email_verified_at: null, created_at: '', updated_at: '' }

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.mocked(userApi.getMe).mockResolvedValue({ status: 'success', message: '', data: { user } })
  })

  it('mengambil profil dan menampilkan nama + username', async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent)
    expect(wrapper.get('[data-testid="nav-name"]').text()).toBe('Memuat...')
    expect(wrapper.get('[data-testid="nav-username"]').text()).toBe('')
    await flushPromises()
    expect(wrapper.get('[data-testid="nav-name"]').text()).toBe('Delcom Testing')
    expect(wrapper.get('[data-testid="nav-username"]').text()).toBe('@testing')
    expect(wrapper.text()).toContain('Sesi Aktif')
  })

  it('memakai user dari authStore dan tidak memuat ulang bila profil sudah ada', async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent, {
      initialState: { users: { users: [], profile: user, isLoading: false, isSaving: false, error: null } },
    })
    expect(userApi.getMe).not.toHaveBeenCalled()
    useUsersStore(pinia).profile = null
    useAuthStore(pinia).user = { ...user, name: 'Dari Auth' }
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[data-testid="nav-name"]').text()).toBe('Dari Auth')
  })

  it('mengirim event toggle-sidebar', async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent)
    await wrapper.get('button[aria-label="Buka menu"]').trigger('click')
    expect(wrapper.emitted('toggle-sidebar')).toHaveLength(1)
  })

  it('logout: dibatalkan dan dikonfirmasi', async () => {
    putAccessToken('tok')
    const { wrapper, router, pinia } = await renderWithProviders(NavbarComponent)
    await flushPromises()
    const logoutButton = wrapper.findAll('button').at(-1)!

    vi.mocked(showConfirmDialog).mockResolvedValue(false)
    await logoutButton.trigger('click')
    await flushPromises()
    expect(useAuthStore(pinia).token).toBe('tok')

    vi.mocked(showConfirmDialog).mockResolvedValue(true)
    await logoutButton.trigger('click')
    await flushPromises()
    expect(useAuthStore(pinia).token).toBeNull()
    expect(useUsersStore(pinia).profile).toBeNull()
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })
})
