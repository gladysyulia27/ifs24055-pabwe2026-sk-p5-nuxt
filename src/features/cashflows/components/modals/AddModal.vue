<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Tambah arus kas">
    <div class="absolute inset-0 bg-slate-900/50" data-testid="modal-backdrop" @click="close" />
    <div class="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-extrabold text-slate-900">Catat Arus Kas Baru</h2>
        <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Tutup" @click="close"><X class="h-5 w-5" /></button>
      </div>
      <CashFlowForm
        submit-label="Simpan"
        :labels="store.labels"
        :submitting="store.isCashFlowAdd"
        @submit="handleSubmit"
        @cancel="close"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { showErrorDialog, showSuccessDialog } from '../../../../helpers/toolsHelper'
import { useCashFlowsStore, type CashFlowPayload } from '../../states/cashFlowsStore'
import CashFlowForm from '../CashFlowForm.vue'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const store = useCashFlowsStore()

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit(payload: CashFlowPayload) {
  if (await store.addCashFlow(payload)) {
    close()
    emit('saved')
    await showSuccessDialog('Catatan arus kas berhasil ditambahkan.')
  } else {
    await showErrorDialog(store.error ?? '')
  }
}
</script>
