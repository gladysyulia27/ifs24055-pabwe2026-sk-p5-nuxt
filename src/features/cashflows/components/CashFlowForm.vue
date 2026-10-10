<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Jenis arus kas">
      <label
        v-for="option in typeOptions"
        :key="option.value"
        class="cursor-pointer text-center rounded-lg px-3 py-2 text-sm font-semibold transition"
        :class="form.values.type === option.value ? option.activeClass : 'text-slate-500 hover:text-slate-800'"
      >
        <input
          type="radio"
          name="type"
          :value="option.value"
          class="sr-only"
          :checked="form.values.type === option.value"
          @change="form.setValue('type', option.value)"
        />
        {{ option.label }}
      </label>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label class="label" for="cf-source">Sumber Dana</label>
        <select id="cf-source" v-model="form.values.source" class="input">
          <option v-for="option in sourceOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
      <div>
        <label class="label" for="cf-label">Label Kategori</label>
        <input id="cf-label" v-model="form.values.label" class="input" list="cf-label-list" placeholder="mis. gaji, makanan" />
        <datalist id="cf-label-list">
          <option v-for="label in labels" :key="label" :value="label" />
        </datalist>
      </div>
    </div>

    <div>
      <label class="label" for="cf-nominal">Nominal (Rp)</label>
      <input id="cf-nominal" v-model.number="form.values.nominal" class="input" type="number" min="1" step="1" placeholder="0" />
      <p class="mt-1 text-xs text-slate-500">{{ formatRupiah(form.values.nominal) }}</p>
    </div>

    <div>
      <label class="label" for="cf-description">Keterangan</label>
      <textarea id="cf-description" v-model="form.values.description" class="input min-h-24" placeholder="Catatan tambahan (opsional)" />
    </div>

    <p v-if="errorMessage" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">{{ errorMessage }}</p>

    <div class="flex justify-end gap-3">
      <button type="button" class="btn-ghost" @click="emit('cancel')">Batal</button>
      <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? 'Menyimpan...' : submitLabel }}</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatRupiah } from '../../../helpers/toolsHelper'
import { useInput } from '../../../hooks/useInput'
import type { CashFlowPayload } from '../states/cashFlowsStore'

const props = defineProps<{
  initial?: CashFlowPayload
  labels?: string[]
  submitting?: boolean
  submitLabel: string
}>()
const emit = defineEmits<{
  (e: 'submit', payload: CashFlowPayload): void
  (e: 'cancel'): void
}>()

const typeOptions = [
  { value: 'inflow', label: 'Pemasukan (Inflow)', activeClass: 'bg-white text-emerald-700 shadow-sm' },
  { value: 'outflow', label: 'Pengeluaran (Outflow)', activeClass: 'bg-white text-rose-700 shadow-sm' },
] as const

const sourceOptions = [
  { value: 'cash', label: 'Tunai' },
  { value: 'savings', label: 'Tabungan' },
  { value: 'loans', label: 'Pinjaman' },
] as const

const blank: CashFlowPayload = { type: 'inflow', source: 'cash', label: '', nominal: 0, description: '' }
const form = useInput<CashFlowPayload>({ ...blank })
const errorMessage = ref('')

watch(
  () => props.initial,
  (initial) => {
    form.setValues({ ...blank, ...initial })
    errorMessage.value = ''
  },
  { immediate: true },
)

function handleSubmit() {
  const label = form.values.label.trim()
  const nominal = Number(form.values.nominal)
  if (!label) {
    errorMessage.value = 'Label kategori wajib diisi.'
    return
  }
  if (nominal <= 0) {
    errorMessage.value = 'Nominal harus lebih besar dari 0.'
    return
  }
  errorMessage.value = ''
  emit('submit', {
    type: form.values.type,
    source: form.values.source,
    label,
    nominal,
    description: form.values.description.trim(),
  })
}
</script>
