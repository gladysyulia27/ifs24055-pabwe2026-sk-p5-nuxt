import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { putAccessToken } from '../../../helpers/apiHelper'
import { renderWithProviders } from '../../../test-utils'
import AuthLayout from './AuthLayout.vue'

describe('AuthLayout', () => {
  it('merender shell dan konten rute anak', async () => {
    const { wrapper, router } = await renderWithProviders(AuthLayout, { route: '/auth/login' })
    expect(wrapper.text()).toContain('Delcom Cash Flow')
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true)
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('mengarahkan pengguna yang sudah login ke beranda', async () => {
    putAccessToken('tok')
    const { router } = await renderWithProviders(AuthLayout, { route: '/auth/login' })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })
})
