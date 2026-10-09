# ifs24055-pabwe2026-sk-p5-nuxt

Aplikasi **Delcom Cash Flow** — Nuxt 4 (SPA, `ssr: false`), TypeScript, Pinia, Tailwind CSS v4, Plus Jakarta Sans,
lucide-vue-next, SweetAlert2. Sumber data: <https://open-api.delcom.org/docs/1.0/api-cash-flows>.

## Menjalankan

```bash
bun install              # otomatis menjalankan `nuxt prepare`
cp .env.example .env     # sesuaikan bila perlu
bun run dev              # development, port dari APP_PORT
bun run build            # build produksi
bun run preview          # build bila perlu, lalu preview lewat start.mjs (port dari APP_PORT)
bun run test:coverage    # Vitest + jsdom + coverage v8 (threshold 100%)
```

## Variabel lingkungan (`.env`)

| Variabel | Fungsi |
| --- | --- |
| `VITE_DELCOM_BASEURL` | Base URL API. Disuntikkan sebagai konstanta global `DELCOM_BASEURL` (`vite.define`, tipe di `src/env.d.ts`). |
| `APP_PORT` | Port dev server (`nuxt.config.ts`) dan preview (`start.mjs`). |

## Struktur

```
src/
  app.vue                 # <RouterView />
  routes.ts               # deklarasi rute (auth, dashboard, 404)
  router.options.ts       # menghubungkan routes.ts ke Nuxt
  helpers/                # apiHelper.ts, toolsHelper.ts
  hooks/                  # useInput.ts
  features/
    auth/                 # api, states (useAuthStore), layouts, pages
    users/                # api, states (useUsersStore), pages
    cashflows/            # api, states (useCashFlowsStore), layouts, components (+modals), pages
    common/pages/         # NotFoundPage.vue
  test-utils.ts           # renderWithProviders, createMockPinia
  setupTests.ts           # jest-dom
```

## Catatan

- Guard rute: `AuthLayout` mengalihkan pengguna yang sudah login ke `/`; `CashFlowLayout` mengalihkan yang belum login ke `/auth/login`.
- Ubah password memakai `PUT /users/password` sesuai dokumentasi Delcom Open API (spesifikasi tugas menulis `/users/me/password`).
- `CashFlowForm.vue` adalah komponen tambahan yang dipakai bersama oleh `AddModal` dan `ChangeModal`.
- Saldo per sumber dana (tunai/tabungan/pinjaman) dihitung dari `total_inflow_<source> - total_outflow_<source>` pada `stats` API.
