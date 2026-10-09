import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../test-utils'
import SidebarComponent from './SidebarComponent.vue'

describe('SidebarComponent', () => {
  it('menampilkan tiga menu navigasi', async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent)
    const links = wrapper.findAll('a')
    expect(links.map((l) => l.text())).toEqual(['Ringkasan Arus Kas', 'Direktori Pengguna', 'Profil Saya'])
    expect(links.map((l) => l.attributes('href'))).toEqual(['/', '/users', '/profile'])
  })

  it('menandai menu aktif sesuai rute', async () => {
    const home = await renderWithProviders(SidebarComponent, { route: '/' })
    expect(home.wrapper.findAll('a')[0].classes()).toContain('!bg-brand-50')
    expect(home.wrapper.findAll('a')[1].classes()).not.toContain('!bg-brand-50')
    const users = await renderWithProviders(SidebarComponent, { route: '/users' })
    expect(users.wrapper.findAll('a')[0].classes()).not.toContain('!bg-brand-50')
    expect(users.wrapper.findAll('a')[1].classes()).toContain('!bg-brand-50')
  })

  it('backdrop hanya muncul saat open dan menutup sidebar', async () => {
    const closed = await renderWithProviders(SidebarComponent, { props: { open: false } })
    expect(closed.wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false)
    expect(closed.wrapper.find('aside').classes()).toContain('-translate-x-full')

    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } })
    expect(wrapper.find('aside').classes()).toContain('translate-x-0')
    await wrapper.get('[data-testid="sidebar-backdrop"]').trigger('click')
    await wrapper.findAll('a')[2].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })
})
