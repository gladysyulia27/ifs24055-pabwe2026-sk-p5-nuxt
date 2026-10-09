<template>
  <div v-if="open" class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" data-testid="sidebar-backdrop" @click="emit('close')" />
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-slate-200 bg-white pt-20 transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-6"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="space-y-1 px-3" aria-label="Navigasi utama">
      <RouterLink
        v-for="item in menus"
        :key="item.to"
        :to="item.to"
        :exact-active-class="item.exact ? activeClass : ''"
        :active-class="item.exact ? '' : activeClass"
        class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        @click="emit('close')"
      >
        <component :is="item.icon" class="h-[18px] w-[18px]" />
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { LayoutDashboard, UserCircle, Users } from 'lucide-vue-next'

defineProps<{ open?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const activeClass = '!bg-brand-50 !text-brand-700'

const menus = [
  { to: '/', label: 'Ringkasan Arus Kas', icon: LayoutDashboard, exact: true },
  { to: '/users', label: 'Direktori Pengguna', icon: Users, exact: false },
  { to: '/profile', label: 'Profil Saya', icon: UserCircle, exact: false },
]
</script>
