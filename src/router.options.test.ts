import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import routerOptions from './router.options'
import { routes } from './routes'

async function loadAll(list: RouteRecordRaw[]): Promise<number> {
  let loaded = 0
  for (const route of list) {
    if (typeof route.component === 'function') {
      const mod = (await (route.component as () => Promise<{ default: unknown }>)()) as { default: unknown }
      expect(mod.default).toBeDefined()
      loaded++
    }
    loaded += await loadAll(route.children ?? [])
  }
  return loaded
}

describe('router.options', () => {
  const getRoutes = () => (routerOptions.routes as () => RouteRecordRaw[])()

  it('mengembalikan deklarasi dari routes.ts', () => {
    expect(getRoutes()).toBe(routes)
  })

  it('memuat seluruh komponen halaman secara lazy', async () => {
    // AuthLayout, Login, Register, CashFlowLayout, Home, Detail, Users, Profile, NotFound
    expect(await loadAll(getRoutes())).toBe(9)
  })

  it('me-resolve rute auth, dashboard, dan wildcard', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: getRoutes() })
    expect(router.resolve('/').name).toBe('home')
    expect(router.resolve('/cash-flows/12')).toMatchObject({ name: 'cash-flow-detail', params: { cashFlowId: '12' } })
    expect(router.resolve('/users').name).toBe('users')
    expect(router.resolve('/profile').name).toBe('profile')
    expect(router.resolve('/auth/login').name).toBe('login')
    expect(router.resolve('/auth/register').name).toBe('register')
    expect(router.resolve('/halaman/tidak/ada').name).toBe('not-found')
    await router.push('/auth')
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })
})
