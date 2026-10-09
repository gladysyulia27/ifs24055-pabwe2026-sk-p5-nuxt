import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { defineComponent, h, type Component } from 'vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from 'vue-router'

export const RouteStub = defineComponent({
  name: 'RouteStub',
  render: () => h('div', { 'data-testid': 'route-stub' }, 'stub'),
})

export const defaultTestRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: RouteStub },
  { path: '/users', name: 'users', component: RouteStub },
  { path: '/profile', name: 'profile', component: RouteStub },
  { path: '/cash-flows/:cashFlowId', name: 'cash-flow-detail', component: RouteStub },
  { path: '/auth/login', name: 'login', component: RouteStub },
  { path: '/auth/register', name: 'register', component: RouteStub },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: RouteStub },
]

/** Membuat Pinia segar (opsional dengan state awal per-store) dan menjadikannya aktif. */
export function createMockPinia(initialState: Record<string, unknown> = {}): Pinia {
  const pinia = createPinia()
  pinia.state.value = initialState
  setActivePinia(pinia)
  return pinia
}

export interface RenderOptions {
  props?: Record<string, unknown>
  route?: string
  routes?: RouteRecordRaw[]
  initialState?: Record<string, unknown>
}

export interface RenderResult {
  wrapper: VueWrapper
  router: Router
  pinia: Pinia
}

/** Me-render komponen dengan Pinia Store dan Memory Router. */
export async function renderWithProviders(
  component: Component,
  options: RenderOptions = {},
): Promise<RenderResult> {
  const pinia = createMockPinia(options.initialState)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes ?? defaultTestRoutes,
  })
  await router.push(options.route ?? '/')
  await router.isReady()
  const wrapper = mount(component, {
    props: options.props,
    global: { plugins: [pinia, router] },
  })
  return { wrapper, router, pinia }
}
