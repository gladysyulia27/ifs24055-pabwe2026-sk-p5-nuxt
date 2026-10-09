import { describe, expect, it } from 'vitest'
import { renderWithProviders } from './test-utils'
import App from './app.vue'

describe('App', () => {
  it('merender RouterView untuk rute aktif', async () => {
    const { wrapper } = await renderWithProviders(App, { route: '/users' })
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true)
  })
})
