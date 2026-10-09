import tailwindcss from '@tailwindcss/vite'

const DEFAULT_BASEURL = 'https://open-api.delcom.org/api/v1'
const delcomBaseUrl = process.env.VITE_DELCOM_BASEURL || DEFAULT_BASEURL

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  srcDir: 'src/',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  // Rute didefinisikan manual di src/routes.ts dan dihubungkan lewat src/router.options.ts
  pages: true,
  css: ['~/index.css'],
  devServer: {
    port: Number(process.env.APP_PORT) || 3000,
  },
  runtimeConfig: {
    public: { delcomBaseUrl },
  },
  vite: {
    plugins: [tailwindcss()],
    // Variabel global DELCOM_BASEURL (lihat src/env.d.ts)
    define: {
      DELCOM_BASEURL: JSON.stringify(delcomBaseUrl),
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
    },
  },
  features: {
    inlineStyles: true,
  },
  app: {
    head: {
      title: 'Delcom Cash Flow',
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'description', content: 'Aplikasi manajemen arus kas Delcom Cash Flow' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
        {
          rel: 'stylesheet',
          media: 'print',
          onload: "this.media='all'",
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
