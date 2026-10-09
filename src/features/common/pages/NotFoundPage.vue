<template>
  <main class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <p class="text-7xl font-extrabold text-brand-600">404</p>
    <h1 class="mt-4 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
    <p class="mt-2 max-w-md text-sm text-slate-500">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
    <RouterLink to="/" class="btn-primary mt-8"><Home class="h-4 w-4" /> Kembali ke Beranda</RouterLink>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Home } from 'lucide-vue-next'
</script>
