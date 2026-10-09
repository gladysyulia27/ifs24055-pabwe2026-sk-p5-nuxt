<template>
  <div v-if="modelValue && cashFlow" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Ubah arus kas">
    <div class="absolute inset-0 bg-slate-900/50" data-testid="modal-backdrop" @click="close" />
    <div class="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-extrabold text-slate-900">Ubah Catatan Arus Kas</h2>
        <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Tutup" @click="close"><X class="h-5 w-5" /></button>
      </div>
      <CashFlowForm
        submit-label="Simpan Perubahan"
        :initial="initial"
        :labels="store.labels"
        :submitting="store.isCashFlowChange"
        @submit="handleSubmit"
        @cancel="close"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { showErrorDialog, showSuccessDialog } from '../../../../helpers/toolsHelper'
import { useCashFlowsStore, type CashFlow, type CashFlowPayload } from '../../states/cashFlowsStore'
import CashFlowForm from '../CashFlowForm.vue'

const props = defineProps<{ modelValue: boolean; cashFlow: CashFlow | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const store = useCashFlowsStore()

const initial = computed<CashFlowPayload | undefined>(() => {
  const { type, source, label, nominal, description } = props.cashFlow as CashFlow
  return { type, source, label, nominal: Number(nominal), description }
})

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit(payload: CashFlowPayload) {
  if (await store.changeCashFlow((props.cashFlow as CashFlow).id, payload)) {
    close()
    emit('saved')
    await showSuccessDialog('Catatan arus kas berhasil diperbarui.')
  } else {
    await showErrorDialog(store.error ?? '')
  }
}
</script>
