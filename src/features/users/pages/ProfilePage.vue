<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <header>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Profil Saya</h1>
      <p class="text-sm text-slate-500">Kelola informasi akun, foto, dan kata sandi Anda.</p>
    </header>

    <div class="card flex flex-col items-center gap-5 p-6 sm:flex-row">
      <img v-if="photoSrc" :src="photoSrc" alt="Foto profil" class="h-24 w-24 rounded-3xl object-cover" />
      <div v-else class="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-100 text-3xl font-bold text-brand-700">
        {{ getInitials(profileForm.values.name) }}
      </div>
      <div class="flex-1 text-center sm:text-left">
        <p class="font-semibold text-slate-900">Foto Profil</p>
        <p class="text-xs text-slate-500">Format JPG atau PNG.</p>
        <div class="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <input ref="fileInput" type="file" accept="image/*" class="text-sm" aria-label="Pilih foto" @change="handleFileChange" />
          <button type="button" class="btn-primary" :disabled="!selectedFile || usersStore.isSaving" @click="handleUploadPhoto">
            <Upload class="h-4 w-4" /> Unggah
          </button>
        </div>
      </div>
    </div>

    <form class="card space-y-5 p-6" novalidate @submit.prevent="handleUpdateProfile">
      <h2 class="font-bold text-slate-900">Informasi Akun</h2>
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label" for="profile-name">Nama</label>
          <input id="profile-name" v-model="profileForm.values.name" class="input" type="text" />
        </div>
        <div>
          <label class="label" for="profile-email">Email</label>
          <input id="profile-email" v-model="profileForm.values.email" class="input" type="email" />
        </div>
      </div>
      <button type="submit" class="btn-primary" :disabled="usersStore.isSaving"><Save class="h-4 w-4" /> Simpan Perubahan</button>
    </form>

    <form class="card space-y-5 p-6" novalidate @submit.prevent="handleChangePassword">
      <h2 class="font-bold text-slate-900">Ubah Kata Sandi</h2>
      <div>
        <label class="label" for="current-password">Kata Sandi Saat Ini</label>
        <input id="current-password" v-model="passwordForm.values.password" class="input" type="password" autocomplete="current-password" />
      </div>
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="label" for="new-password">Kata Sandi Baru</label>
          <input id="new-password" v-model="passwordForm.values.new_password" class="input" type="password" autocomplete="new-password" />
        </div>
        <div>
          <label class="label" for="confirm-password">Konfirmasi Kata Sandi Baru</label>
          <input id="confirm-password" v-model="passwordForm.values.new_password_confirmation" class="input" type="password" autocomplete="new-password" />
        </div>
      </div>
      <p v-if="passwordError" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">{{ passwordError }}</p>
      <button type="submit" class="btn-primary" :disabled="usersStore.isSaving"><KeyRound class="h-4 w-4" /> Ubah Kata Sandi</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { KeyRound, Save, Upload } from 'lucide-vue-next'
import { resolveAssetUrl } from '../../../helpers/apiHelper'
import { getInitials, showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import { useUsersStore } from '../states/usersStore'

const usersStore = useUsersStore()
const profileForm = useInput({ name: '', email: '' })
const passwordForm = useInput({ password: '', new_password: '', new_password_confirmation: '' })
const passwordError = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const photoSrc = computed(() => resolveAssetUrl(usersStore.profile?.photo))

watch(
  () => usersStore.profile,
  (profile) => {
    if (profile) profileForm.setValues({ name: profile.name, email: profile.email })
  },
  { immediate: true },
)

onMounted(() => {
  usersStore.fetchProfile()
})

function handleFileChange(event: Event) {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function handleUploadPhoto() {
  if (await usersStore.uploadPhoto(selectedFile.value as File)) {
    selectedFile.value = null
    ;(fileInput.value as HTMLInputElement).value = ''
    await showSuccessDialog('Foto profil berhasil diperbarui.')
  } else {
    await showErrorDialog(usersStore.error as string)
  }
}

async function handleUpdateProfile() {
  const ok = await usersStore.updateProfile({
    name: profileForm.values.name.trim(),
    email: profileForm.values.email.trim(),
  })
  if (ok) await showSuccessDialog('Profil berhasil diperbarui.')
  else await showErrorDialog(usersStore.error as string)
}

async function handleChangePassword() {
  passwordError.value = ''
  const { password, new_password, new_password_confirmation } = passwordForm.values
  if (!password || !new_password) {
    passwordError.value = 'Kata sandi saat ini dan kata sandi baru wajib diisi.'
    return
  }
  if (new_password !== new_password_confirmation) {
    passwordError.value = 'Konfirmasi kata sandi baru tidak cocok.'
    return
  }
  if (await usersStore.changePassword({ password, new_password, new_password_confirmation })) {
    passwordForm.reset()
    await showSuccessDialog('Kata sandi berhasil diubah.')
  } else {
    await showErrorDialog(usersStore.error as string)
  }
}
</script>
