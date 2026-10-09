<template>
  <div>
    <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Buat akun baru</h1>
    <p class="mt-1 text-sm text-slate-500">Daftar gratis dan mulai mencatat arus kas Anda.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="handleSubmit">
      <div>
        <label class="label" for="name">Nama Lengkap</label>
        <input id="name" v-model="form.values.name" type="text" class="input" placeholder="Nama Anda" autocomplete="name" />
      </div>
      <div>
        <label class="label" for="email">Email</label>
        <input id="email" v-model="form.values.email" type="email" class="input" placeholder="nama@delcom.org" autocomplete="email" />
      </div>
      <div>
        <label class="label" for="password">Kata Sandi</label>
        <input id="password" v-model="form.values.password" type="password" class="input" placeholder="Minimal 6 karakter" autocomplete="new-password" />
      </div>
      <p v-if="validationError" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">{{ validationError }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="authStore.isLoading">
        <UserPlus class="h-4 w-4" />
        {{ authStore.isLoading ? 'Memproses...' : 'Daftar' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-brand-600 hover:underline">Masuk</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { UserPlus } from 'lucide-vue-next'
import { useInput } from '../../../hooks/useInput'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const authStore = useAuthStore()
const form = useInput({ name: '', email: '', password: '' })
const validationError = ref('')

async function handleSubmit() {
  validationError.value = ''
  if (!form.values.name.trim() || !form.values.email.trim() || !form.values.password) {
    validationError.value = 'Nama, email, dan kata sandi wajib diisi.'
    return
  }
  if (form.values.password.length < 6) {
    validationError.value = 'Kata sandi minimal 6 karakter.'
    return
  }
  const ok = await authStore.register({
    name: form.values.name.trim(),
    email: form.values.email.trim(),
    password: form.values.password,
  })
  if (ok) {
    await showSuccessDialog('Akun berhasil dibuat. Silakan masuk.', 'Pendaftaran Berhasil')
    await router.push('/auth/login')
  } else {
    await showErrorDialog(authStore.error ?? '', 'Pendaftaran Gagal')
  }
}
</script>
