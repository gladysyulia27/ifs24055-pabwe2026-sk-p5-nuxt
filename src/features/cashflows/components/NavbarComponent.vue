<template>
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <button type="button" class="btn-ghost !p-2 lg:hidden" aria-label="Buka menu" @click="emit('toggle-sidebar')">
          <Menu class="h-5 w-5" />
        </button>
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><WalletCards class="h-5 w-5" /></div>
          <span class="hidden text-base font-extrabold tracking-tight text-slate-900 sm:block">Delcom Cash Flow</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right leading-tight">
          <p class="text-sm font-semibold text-slate-900" data-testid="nav-name">{{ user?.name ?? 'Memuat...' }}</p>
          <p class="text-xs text-slate-500" data-testid="nav-username">{{ username }}</p>
        </div>
        <span class="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sesi Aktif
        </span>
        <button type="button" class="btn-ghost" @click="handleLogout"><LogOut class="h-4 w-4" /> <span class="hidden sm:inline">Keluar</span></button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Menu, WalletCards } from 'lucide-vue-next'
import { showConfirmDialog } from '../../../helpers/toolsHelper'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import { useCashFlowsStore } from '../states/cashFlowsStore'

const emit = defineEmits<(e: 'toggle-sidebar') => void>()

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const cashFlowsStore = useCashFlowsStore()

const user = computed(() => usersStore.profile ?? authStore.user)
const username = computed(() => (user.value ? `@${user.value.email.split('@')[0]}` : ''))

onMounted(() => {
  if (!usersStore.profile) usersStore.fetchProfile()
})

async function handleLogout() {
  if (!(await showConfirmDialog('Anda akan keluar dari sesi ini.', 'Ya, keluar', 'Keluar dari aplikasi?'))) return
  authStore.logout()
  usersStore.reset()
  cashFlowsStore.reset()
  await router.push('/auth/login')
}
</script>
