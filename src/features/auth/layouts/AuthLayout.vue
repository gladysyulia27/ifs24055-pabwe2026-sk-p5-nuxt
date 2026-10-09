<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
    <div class="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

    <div class="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
      <aside class="hidden flex-col justify-between bg-linear-to-br from-brand-600 to-brand-700 p-10 text-white lg:flex">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <WalletCards class="h-6 w-6" />
          </div>
          <span class="text-lg font-extrabold tracking-tight">Delcom Cash Flow</span>
        </div>
        <div>
          <h2 class="text-3xl font-extrabold leading-tight">Catat arus kas, pantau saldo, tetap terkendali.</h2>
          <p class="mt-4 text-sm leading-relaxed text-white/80">
            Kelola pemasukan dan pengeluaran dari kas tunai, tabungan, hingga pinjaman dalam satu dasbor yang ringkas.
          </p>
        </div>
        <p class="text-xs text-white/60">© Delcom Open API</p>
      </aside>

      <main class="p-8 sm:p-12">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { WalletCards } from 'lucide-vue-next'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace('/')
  }
})
</script>
