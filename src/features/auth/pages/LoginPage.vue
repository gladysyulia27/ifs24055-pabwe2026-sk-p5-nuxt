<template>
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Selamat datang kembali</h1>
    <p class="mt-1 text-sm text-slate-500">Masuk untuk melanjutkan ke dasbor arus kas Anda.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
      <div>
        <label class="label" for="email">Email</label>
        <input id="email" v-model="form.values.email" type="email" class="input" placeholder="nama@delcom.org" autocomplete="email" />
      </div>
      <div>
        <label class="label" for="password">Kata Sandi</label>
        <input id="password" v-model="form.values.password" type="password" class="input" placeholder="••••••••" autocomplete="current-password" />
      </div>
      <p v-if="validationError" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">{{ validationError }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="authStore.isLoading">
        <LogIn class="h-4 w-4" />
        {{ authStore.isLoading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-brand-600 hover:underline">Daftar sekarang</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { LogIn } from 'lucide-vue-next'
import { useInput } from '../../../hooks/useInput'
import { showErrorDialog } from '../../../helpers/toolsHelper'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const authStore = useAuthStore()
const form = useInput({ email: '', password: '' })
const validationError = ref('')

async function handleSubmit() {
  validationError.value = ''
  if (!form.values.email.trim() || !form.values.password) {
    validationError.value = 'Email dan kata sandi wajib diisi.'
    return
  }
  const ok = await authStore.login({ email: form.values.email.trim(), password: form.values.password })
  if (ok) {
    await router.push('/')
  } else {
    await showErrorDialog(authStore.error ?? '', 'Login Gagal')
  }
}
</script>
