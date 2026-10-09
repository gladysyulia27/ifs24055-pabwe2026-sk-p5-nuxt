import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showErrorDialog, showSuccessDialog } from '../../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../../test-utils'
import * as api from '../../api/cashFlowApi'
import { useCashFlowsStore } from '../../states/cashFlowsStore'
import AddModal from './AddModal.vue'

vi.mock('../../api/cashFlowApi')
vi.mock('../../../../helpers/toolsHelper', async (orig) => ({
  ...(await orig<typeof import('../../../../helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

type W = Awaited<ReturnType<typeof renderWithProviders>>['wrapper']
const submit = async (w: W) => {
  await w.find('form').trigger('submit')
  await flushPromises()
}

describe('AddModal', () => {
  beforeEach(() => {
    vi.mocked(showErrorDialog).mockResolvedValue()
    vi.mocked(showSuccessDialog).mockResolvedValue()
  })

  it('tidak merender apa pun saat tertutup', async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { modelValue: false } })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('validasi label dan nominal', async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { modelValue: true } })
    await submit(wrapper)
    expect(wrapper.text()).toContain('Label kategori wajib diisi')
    await wrapper.find('#cf-label').setValue('gaji')
    await submit(wrapper)
    expect(wrapper.text()).toContain('Nominal harus lebih besar dari 0')
    expect(api.addCashFlow).not.toHaveBeenCalled()
  })

  it('menyimpan transaksi baru dengan pilihan jenis, sumber, label, nominal, keterangan', async () => {
    vi.mocked(api.addCashFlow).mockResolvedValue({ status: 'success', message: '', data: { cash_flow_id: 1 } })
    const { wrapper } = await renderWithProviders(AddModal, { props: { modelValue: true } })
    const buttons = wrapper.findAll('[role="radio"]')
    await buttons[1].trigger('click')
    expect(buttons[1].attributes('aria-checked')).toBe('true')
    await wrapper.find('#cf-source').setValue('savings')
    await wrapper.find('#cf-label').setValue('  makanan ')
    await wrapper.find('#cf-nominal').setValue('50000')
    await wrapper.find('#cf-description').setValue(' makan siang ')
    await submit(wrapper)
    expect(api.addCashFlow).toHaveBeenCalledWith({ type: 'outflow', source: 'savings', label: 'makanan', nominal: 50000, description: 'makan siang' })
    expect(showSuccessDialog).toHaveBeenCalled()
    expect(wrapper.emitted('saved')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('menampilkan dialog error saat gagal', async () => {
    vi.mocked(api.addCashFlow).mockRejectedValue(new Error('Data tidak valid'))
    const { wrapper } = await renderWithProviders(AddModal, { props: { modelValue: true } })
    await wrapper.find('#cf-label').setValue('x')
    await wrapper.find('#cf-nominal').setValue('10')
    await submit(wrapper)
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak valid')
    expect(wrapper.emitted('saved')).toBeUndefined()
  })

  it('error null memakai string kosong, label tersedia dari store, dan status submitting', async () => {
    vi.mocked(api.addCashFlow).mockImplementation(async () => {
      throw 'bukan-error-objek'
    })
    const { wrapper, pinia } = await renderWithProviders(AddModal, { props: { modelValue: true } })
    const store = useCashFlowsStore(pinia)
    store.labels = ['gaji']
    store.addCashFlow = vi.fn().mockResolvedValue(false)
    store.error = null
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('datalist option')).toHaveLength(1)
    await wrapper.find('#cf-label').setValue('x')
    await wrapper.find('#cf-nominal').setValue('10')
    await submit(wrapper)
    expect(showErrorDialog).toHaveBeenCalledWith('')
    store.isCashFlowAdd = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Menyimpan')
  })

  it('tombol batal, tutup, dan backdrop menutup modal', async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { modelValue: true } })
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.find('[data-testid="modal-backdrop"]').trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Batal')!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(3)
  })
})
