import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorDialog, showSuccessDialog } from '../../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../../test-utils'
import * as api from '../../api/cashFlowApi'
import { useCashFlowsStore, type CashFlow } from '../../states/cashFlowsStore'
import ChangeModal from './ChangeModal.vue'

vi.mock('../../api/cashFlowApi')
vi.mock('../../../../helpers/toolsHelper', async (orig) => ({
  ...(await orig<typeof import('../../../../helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const cashFlow: CashFlow = { id: 7, user_id: 1, type: 'outflow', source: 'savings', label: 'alat-elektronik', description: 'Keyboard', nominal: 400000, created_at: '', updated_at: '' }

describe('ChangeModal', () => {
  beforeEach(() => {
    vi.mocked(showErrorDialog).mockResolvedValue()
    vi.mocked(showSuccessDialog).mockResolvedValue()
  })

  it('tidak tampil saat tertutup atau tanpa data', async () => {
    const closed = await renderWithProviders(ChangeModal, { props: { modelValue: false, cashFlow } })
    expect(closed.wrapper.find('[role="dialog"]').exists()).toBe(false)
    const empty = await renderWithProviders(ChangeModal, { props: { modelValue: true, cashFlow: null } })
    expect(empty.wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('mengisi form dengan data tersimpan dan menyimpan perubahan', async () => {
    vi.mocked(api.updateCashFlow).mockResolvedValue({ status: 'success', message: '', data: null })
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { modelValue: true, cashFlow } })
    expect((wrapper.find('#cf-label').element as HTMLInputElement).value).toBe('alat-elektronik')
    expect((wrapper.find('#cf-source').element as HTMLSelectElement).value).toBe('savings')
    await wrapper.find('#cf-nominal').setValue('450000')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(api.updateCashFlow).toHaveBeenCalledWith(7, { type: 'outflow', source: 'savings', label: 'alat-elektronik', nominal: 450000, description: 'Keyboard' })
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(showSuccessDialog).toHaveBeenCalled()
  })

  it('menampilkan dialog error saat gagal dan menutup lewat tombol tutup', async () => {
    vi.mocked(api.updateCashFlow).mockRejectedValue(new Error('Gagal ubah'))
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { modelValue: true, cashFlow } })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal ubah')
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.find('[data-testid="modal-backdrop"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
  })

  it('error store null memakai string kosong', async () => {
    const { wrapper, pinia } = await renderWithProviders(ChangeModal, { props: { modelValue: true, cashFlow } })
    useCashFlowsStore(pinia).changeCashFlow = vi.fn().mockResolvedValue(false)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('')
  })
})
