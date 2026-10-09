import type { RouterConfig } from '@nuxt/schema'
import { routes } from './routes'

// Menggantikan rute otomatis Nuxt dengan deklarasi manual di src/routes.ts
const routerOptions: RouterConfig = {
  routes: () => routes,
}

export default routerOptions
