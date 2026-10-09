<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="mx-auto flex max-w-[1500px]">
      <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
      <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/states/authStore'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

// Guard rute terproteksi: pengguna tanpa token diarahkan ke halaman login.
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.replace('/auth/login')
  }
})
</script>
