<template>
  <section>
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Direktori Pengguna</h1>
        <p class="text-sm text-slate-500">Daftar seluruh pengguna yang terdaftar di sistem.</p>
      </div>
      <div class="relative w-full sm:w-72">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input v-model="keyword" type="search" class="input pl-9" placeholder="Cari nama atau email..." aria-label="Cari pengguna" />
      </div>
    </header>

    <p v-if="usersStore.isLoading" class="py-16 text-center text-sm text-slate-500">Memuat pengguna...</p>
    <p v-else-if="usersStore.error" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-600" role="alert">{{ usersStore.error }}</p>
    <p v-else-if="filteredUsers.length === 0" class="py-16 text-center text-sm text-slate-500">Tidak ada pengguna yang cocok.</p>

    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="user in filteredUsers" :key="user.id" class="card flex items-center gap-4 p-4" data-testid="user-item">
        <img v-if="resolveAssetUrl(user.photo)" :src="resolveAssetUrl(user.photo)" :alt="user.name" class="h-14 w-14 rounded-2xl object-cover" />
        <div v-else class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">
          {{ getInitials(user.name) }}
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
          <p class="mt-1 text-xs text-slate-600">Bergabung {{ formatDate(user.created_at) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { resolveAssetUrl } from '../../../helpers/apiHelper'
import { formatDate, getInitials } from '../../../helpers/toolsHelper'
import { useUsersStore } from '../states/usersStore'

const usersStore = useUsersStore()
const keyword = ref('')

const filteredUsers = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  return usersStore.users.filter(
    (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
  )
})

onMounted(() => {
  usersStore.fetchUsers()
})
</script>
