import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { putAccessToken } from '../../../helpers/apiHelper'
import { renderWithProviders } from '../../../test-utils'
import * as userApi from '../../users/api/userApi'
import CashFlowLayout from './CashFlowLayout.vue'

vi.mock('../../users/api/userApi')

describe('CashFlowLayout', () => {
  it('mengarahkan ke login bila belum terautentikasi', async () => {
    const { router } = await renderWithProviders(CashFlowLayout)
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('merender navbar, sidebar, dan konten rute untuk pengguna login', async () => {
    putAccessToken('tok')
    vi.mocked(userApi.getMe).mockResolvedValue({
      status: 'success', message: '',
      data: { user: { id: 1, name: 'Delcom', email: 'd@delcom.org', email_verified_at: null, created_at: '', updated_at: '' } },
    })
    const { wrapper, router } = await renderWithProviders(CashFlowLayout)
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Delcom')
  })

  it('membuka dan menutup sidebar mobile', async () => {
    putAccessToken('tok')
    vi.mocked(userApi.getMe).mockRejectedValue(new Error('x'))
    const { wrapper } = await renderWithProviders(CashFlowLayout)
    await flushPromises()
    await wrapper.get('button[aria-label="Buka menu"]').trigger('click')
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true)
    await wrapper.get('[data-testid="sidebar-backdrop"]').trigger('click')
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false)
  })
})
