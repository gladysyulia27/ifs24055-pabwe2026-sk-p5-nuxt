<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-500">Pantau saldo, pemasukan, dan pengeluaran Anda.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn-danger" @click="handleDeleteAll"><Trash2 class="h-4 w-4" /> Reset Semua</button>
        <button type="button" class="btn-primary" @click="showAdd = true"><Plus class="h-4 w-4" /> Tambah Transaksi</button>
      </div>
    </header>

    <!-- Kartu metrik -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="metric in metrics" :key="metric.key" class="card flex items-center gap-4 p-5" :data-testid="`metric-${metric.key}`">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl" :class="metric.tone"><component :is="metric.icon" class="h-6 w-6" /></div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ metric.label }}</p>
          <p class="text-xl font-extrabold text-slate-900">{{ formatRupiah(metric.value) }}</p>
        </div>
      </article>
    </div>

    <!-- Tren -->
    <div class="card p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 font-bold text-slate-900"><TrendingUp class="h-4 w-4 text-brand-600" /> Tren Arus Kas</h2>
        <div class="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button type="button" class="rounded-lg px-3 py-1.5" :class="trendMode === 'daily' ? 'bg-white shadow-sm' : 'text-slate-500'" @click="trendMode = 'daily'">Harian</button>
          <button type="button" class="rounded-lg px-3 py-1.5" :class="trendMode === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-500'" @click="trendMode = 'monthly'">Bulanan</button>
        </div>
      </div>
      <p v-if="trendRows.length === 0" class="py-6 text-center text-sm text-slate-400">Belum ada data tren.</p>
      <div v-else class="flex h-40 items-end gap-2 overflow-x-auto" data-testid="trend-chart">
        <div v-for="row in trendRows" :key="row.label" class="flex min-w-10 flex-1 flex-col items-center gap-1">
          <div class="flex h-32 items-end gap-0.5">
            <div class="w-2.5 rounded-t bg-emerald-500" :style="{ height: `${(row.inflow / trendMax) * 100}%` }" :title="`Inflow ${formatRupiah(row.inflow)}`" />
            <div class="w-2.5 rounded-t bg-rose-500" :style="{ height: `${(row.outflow / trendMax) * 100}%` }" :title="`Outflow ${formatRupiah(row.outflow)}`" />
          </div>
          <span class="text-[10px] text-slate-400">{{ row.label }}</span>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <form class="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-6" @submit.prevent="loadList">
      <div>
        <label class="label" for="f-type">Jenis</label>
        <select id="f-type" v-model="filters.type" class="input">
          <option value="">Semua</option>
          <option value="inflow">Inflow</option>
          <option value="outflow">Outflow</option>
        </select>
      </div>
      <div>
        <label class="label" for="f-source">Sumber</label>
        <select id="f-source" v-model="filters.source" class="input">
          <option value="">Semua</option>
          <option value="cash">Tunai</option>
          <option value="savings">Tabungan</option>
          <option value="loans">Pinjaman</option>
        </select>
      </div>
      <div>
        <label class="label" for="f-label">Label</label>
        <select id="f-label" v-model="filters.label" class="input">
          <option value="">Semua</option>
          <option v-for="label in store.labels" :key="label" :value="label">{{ label }}</option>
        </select>
      </div>
      <div>
        <label class="label" for="f-start">Tanggal Awal</label>
        <input id="f-start" v-model="filters.start" type="date" class="input" />
      </div>
      <div>
        <label class="label" for="f-end">Tanggal Akhir</label>
        <input id="f-end" v-model="filters.end" type="date" class="input" />
      </div>
      <div class="flex items-end gap-2">
        <button type="submit" class="btn-primary flex-1"><Filter class="h-4 w-4" /> Terapkan</button>
        <button type="button" class="btn-ghost" aria-label="Reset filter" @click="resetFilters"><RotateCcw class="h-4 w-4" /></button>
      </div>
    </form>

    <!-- Daftar transaksi -->
    <p v-if="store.isLoading" class="py-10 text-center text-sm text-slate-500">Memuat data...</p>
    <p v-else-if="store.error" class="rounded-xl bg-rose-50 p-4 text-sm text-rose-600" role="alert">{{ store.error }}</p>
    <p v-else-if="store.cashFlows.length === 0" class="card py-12 text-center text-sm text-slate-500">Belum ada transaksi arus kas.</p>
    <template v-else>
      <div class="card hidden overflow-x-auto md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-5 py-3">Tanggal</th><th class="px-5 py-3">Label</th><th class="px-5 py-3">Sumber</th>
              <th class="px-5 py-3">Jenis</th><th class="px-5 py-3 text-right">Nominal</th><th class="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in store.cashFlows" :key="item.id" data-testid="cashflow-row">
              <td class="px-5 py-3 text-slate-500">{{ formatDateTime(item.created_at) }}</td>
              <td class="px-5 py-3 font-semibold text-slate-900">{{ item.label }}</td>
              <td class="px-5 py-3">{{ sourceLabels[item.source] }}</td>
              <td class="px-5 py-3"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="badgeClass(item.type)">{{ typeLabels[item.type] }}</span></td>
              <td class="px-5 py-3 text-right font-bold" :class="item.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'">{{ formatRupiah(item.nominal) }}</td>
              <td class="px-5 py-3">
                <div class="flex justify-end gap-1">
                  <RouterLink :to="`/cash-flows/${item.id}`" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Lihat detail"><Eye class="h-4 w-4" /></RouterLink>
                  <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Ubah" @click="openEdit(item)"><Pencil class="h-4 w-4" /></button>
                  <button type="button" class="rounded-lg p-2 text-rose-500 hover:bg-rose-50" aria-label="Hapus" @click="handleDelete(item)"><Trash2 class="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="space-y-3 md:hidden">
        <li v-for="item in store.cashFlows" :key="item.id" class="card p-4" data-testid="cashflow-card">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-slate-900">{{ item.label }}</p>
              <p class="text-xs text-slate-500">{{ sourceLabels[item.source] }} · {{ formatDateTime(item.created_at) }}</p>
            </div>
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="badgeClass(item.type)">{{ typeLabels[item.type] }}</span>
          </div>
          <p class="mt-3 text-lg font-extrabold" :class="item.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'">{{ formatRupiah(item.nominal) }}</p>
          <div class="mt-3 flex gap-2">
            <RouterLink :to="`/cash-flows/${item.id}`" class="btn-ghost flex-1 !py-2">Detail</RouterLink>
            <button type="button" class="btn-ghost !py-2" @click="openEdit(item)">Ubah</button>
            <button type="button" class="btn-ghost !py-2 !text-rose-600" @click="handleDelete(item)">Hapus</button>
          </div>
        </li>
      </ul>
    </template>

    <AddModal v-model="showAdd" @saved="refresh" />
    <ChangeModal v-model="showChange" :cash-flow="editing" @saved="refresh" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowDownCircle, ArrowUpCircle, Eye, Filter, Landmark, Pencil, PiggyBank, Plus, RotateCcw, Trash2, TrendingUp, Wallet, WalletCards,
} from 'lucide-vue-next'
import { formatDateTime, formatRupiah, showConfirmDialog, showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import AddModal from '../components/modals/AddModal.vue'
import ChangeModal from '../components/modals/ChangeModal.vue'
import { useCashFlowsStore, type CashFlow, type CashFlowQueryParams } from '../states/cashFlowsStore'

const store = useCashFlowsStore()

const typeLabels = { inflow: 'Inflow', outflow: 'Outflow' }
const sourceLabels = { cash: 'Tunai', savings: 'Tabungan', loans: 'Pinjaman' }

const filters = reactive({ type: '', source: '', label: '', start: '', end: '' })
const showAdd = ref(false)
const showChange = ref(false)
const editing = ref<CashFlow | null>(null)
const trendMode = ref<'daily' | 'monthly'>('daily')

const metrics = computed(() => [
  { key: 'cashflow', label: 'Total Saldo Kas Bersih', value: store.stats.cashflow, icon: WalletCards, tone: 'bg-brand-100 text-brand-700' },
  { key: 'inflow', label: 'Total Pemasukan', value: store.stats.total_inflow, icon: ArrowDownCircle, tone: 'bg-emerald-100 text-emerald-700' },
  { key: 'outflow', label: 'Total Pengeluaran', value: store.stats.total_outflow, icon: ArrowUpCircle, tone: 'bg-rose-100 text-rose-700' },
  { key: 'cash', label: 'Saldo Kas Tunai', value: store.stats.cash, icon: Wallet, tone: 'bg-amber-100 text-amber-700' },
  { key: 'savings', label: 'Saldo Tabungan', value: store.stats.savings, icon: PiggyBank, tone: 'bg-sky-100 text-sky-700' },
  { key: 'loans', label: 'Saldo Pinjaman', value: store.stats.loans, icon: Landmark, tone: 'bg-violet-100 text-violet-700' },
])

const trendRows = computed(() => {
  const stats = trendMode.value === 'daily' ? store.dailyStats : store.monthlyStats
  if (!stats) return []
  return Object.keys(stats.stats_inflow).map((label) => ({
    label,
    inflow: stats.stats_inflow[label],
    outflow: stats.stats_outflow[label],
  }))
})
const trendMax = computed(() => Math.max(1, ...trendRows.value.flatMap((row) => [row.inflow, row.outflow])))

function badgeClass(type: CashFlow['type']) {
  return type === 'inflow' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
}

function buildParams(): CashFlowQueryParams {
  return {
    type: filters.type as CashFlowQueryParams['type'],
    source: filters.source as CashFlowQueryParams['source'],
    label: filters.label,
    start_date: filters.start ? `${filters.start} 00:00:00` : undefined,
    end_date: filters.end ? `${filters.end} 23:59:59` : undefined,
  }
}

function loadList() {
  return store.fetchCashFlows(buildParams())
}

async function refresh() {
  await Promise.all([loadList(), store.fetchLabels(), store.fetchDailyStats(), store.fetchMonthlyStats()])
}

function resetFilters() {
  Object.assign(filters, { type: '', source: '', label: '', start: '', end: '' })
  return loadList()
}

function openEdit(item: CashFlow) {
  editing.value = item
  showChange.value = true
}

async function handleDelete(item: CashFlow) {
  if (!(await showConfirmDialog(`Hapus catatan "${item.label}"?`, 'Ya, hapus'))) return
  if (await store.deleteCashFlow(item.id)) {
    await refresh()
    await showSuccessDialog('Catatan arus kas berhasil dihapus.')
  } else {
    await showErrorDialog(store.error ?? '')
  }
}

async function handleDeleteAll() {
  if (!(await showConfirmDialog('Seluruh catatan arus kas Anda akan dihapus permanen.', 'Ya, reset semua', 'Reset semua transaksi?'))) return
  if (await store.deleteAllCashFlows()) {
    await refresh()
    await showSuccessDialog('Seluruh catatan arus kas berhasil dihapus.')
  } else {
    await showErrorDialog(store.error ?? '')
  }
}

onMounted(refresh)
</script>
