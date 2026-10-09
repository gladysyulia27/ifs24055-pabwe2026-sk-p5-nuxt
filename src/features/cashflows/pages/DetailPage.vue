<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft class="h-4 w-4" /> Kembali</RouterLink>

    <p v-if="store.isLoading" class="py-16 text-center text-sm text-slate-500">Memuat detail...</p>
    <p v-else-if="!store.cashFlow" class="card p-6 text-sm text-rose-600" role="alert">{{ store.error ?? 'Data tidak ditemukan.' }}</p>

    <article v-else class="card overflow-hidden">
      <div class="p-6" :class="store.cashFlow.type === 'inflow' ? 'bg-emerald-50' : 'bg-rose-50'">
        <span class="rounded-full bg-white px-3 py-1 text-xs font-bold" :class="store.cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'">
          {{ store.cashFlow.type === 'inflow' ? 'Pemasukan (Inflow)' : 'Pengeluaran (Outflow)' }}
        </span>
        <p class="mt-4 text-3xl font-extrabold text-slate-900" data-testid="detail-nominal">{{ formatRupiah(store.cashFlow.nominal) }}</p>
        <p class="text-sm text-slate-600">{{ store.cashFlow.label }}</p>
      </div>
      <dl class="grid gap-5 p-6 sm:grid-cols-2">
        <div><dt class="label">Label Kategori</dt><dd class="font-semibold">{{ store.cashFlow.label }}</dd></div>
        <div><dt class="label">Sumber Dana</dt><dd class="font-semibold">{{ sourceLabels[store.cashFlow.source] }}</dd></div>
        <div class="sm:col-span-2"><dt class="label">Deskripsi</dt><dd>{{ store.cashFlow.description || '-' }}</dd></div>
        <div><dt class="label">Dibuat</dt><dd>{{ formatDateTime(store.cashFlow.created_at) }}</dd></div>
        <div><dt class="label">Diperbarui</dt><dd>{{ formatDateTime(store.cashFlow.updated_at) }}</dd></div>
      </dl>
      <div class="flex justify-end gap-3 border-t border-slate-100 p-4">
        <button type="button" class="btn-ghost" @click="showChange = true"><Pencil class="h-4 w-4" /> Ubah</button>
        <button type="button" class="btn-danger" @click="handleDelete"><Trash2 class="h-4 w-4" /> Hapus</button>
      </div>
    </article>

    <ChangeModal v-model="showChange" :cash-flow="store.cashFlow" @saved="load" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-vue-next'
import { formatDateTime, formatRupiah, showConfirmDialog, showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import ChangeModal from '../components/modals/ChangeModal.vue'
import { useCashFlowsStore } from '../states/cashFlowsStore'

const route = useRoute()
const router = useRouter()
const store = useCashFlowsStore()
const showChange = ref(false)
const sourceLabels = { cash: 'Tunai', savings: 'Tabungan', loans: 'Pinjaman' }

const cashFlowId = () => String(route.params.cashFlowId)
const load = () => store.fetchCashFlow(cashFlowId())

onMounted(load)

async function handleDelete() {
  if (!(await showConfirmDialog('Catatan ini akan dihapus permanen.', 'Ya, hapus'))) return
  if (await store.deleteCashFlow(cashFlowId())) {
    await showSuccessDialog('Catatan arus kas berhasil dihapus.')
    await router.push('/')
  } else {
    await showErrorDialog(store.error ?? '')
  }
}
</script>
