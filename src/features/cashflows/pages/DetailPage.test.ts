import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import * as api from '../api/cashFlowApi'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import DetailPage from './DetailPage.vue'

vi.mock('../api/cashFlowApi')
vi.mock('../../../helpers/toolsHelper', async (orig) => ({
  ...(await orig<typeof import('../../../helpers/toolsHelper')>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const ok = <T>(data: T) => ({ status: 'success', message: '', data })
const base = { id: 4, user_id: 1, type: 'outflow', source: 'savings', label: 'alat-elektronik', description: 'Membeli keyboard', nominal: 400000, created_at: '2024-10-05T12:09:16.000000Z', updated_at: '2024-10-06T12:09:16.000000Z' } as const

async function setup(cashFlow: Record<string, unknown> = base) {
  vi.mocked(api.getCashFlow).mockResolvedValue(ok({ cash_flow: cashFlow as never }))
  const result = await renderWithProviders(DetailPage, { route: '/cash-flows/4' })
  await flushPromises()
  return result
}

describe('DetailPage', () => {
  beforeEach(() => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true)
    vi.mocked(showErrorDialog).mockResolvedValue()
    vi.mocked(showSuccessDialog).mockResolvedValue()
  })

  it('menampilkan rincian pengeluaran', async () => {
    const { wrapper } = await setup()
    expect(api.getCashFlow).toHaveBeenCalledWith('4')
    expect(wrapper.text()).toContain('Pengeluaran (Outflow)')
    expect(wrapper.text()).toContain('Tabungan')
    expect(wrapper.text()).toContain('Membeli keyboard')
    expect(wrapper.get('[data-testid="detail-nominal"]').text().replace(/\s/g, ' ')).toBe('Rp 400.000')
  })

  it('menampilkan pemasukan dengan deskripsi kosong', async () => {
    const { wrapper } = await setup({ ...base, type: 'inflow', source: 'cash', description: '' })
    expect(wrapper.text()).toContain('Pemasukan (Inflow)')
    expect(wrapper.text()).toContain('-')
  })

  it('menampilkan loading, error API, dan pesan default', async () => {
    vi.mocked(api.getCashFlow).mockRejectedValue(new Error('Data tidak ditemukan dari API'))
    const { wrapper, pinia } = await renderWithProviders(DetailPage, { route: '/cash-flows/99' })
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Data tidak ditemukan dari API')
    const store = useCashFlowsStore(pinia)
    store.error = null
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[role="alert"]').text()).toBe('Data tidak ditemukan.')
    store.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Memuat detail')
  })

  it('mengubah transaksi dan memuat ulang detail', async () => {
    vi.mocked(api.updateCashFlow).mockResolvedValue(ok(null))
    const { wrapper } = await setup()
    await wrapper.findAll('button').find((b) => b.text().includes('Ubah'))!.trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    await wrapper.get('[role="dialog"] form').trigger('submit')
    await flushPromises()
    expect(api.updateCashFlow).toHaveBeenCalledWith(4, expect.any(Object))
    expect(vi.mocked(api.getCashFlow).mock.calls.length).toBe(2)
  })

  it('menghapus transaksi: batal, sukses (kembali ke beranda), gagal', async () => {
    vi.mocked(api.deleteCashFlow).mockResolvedValue(ok(null))
    const { wrapper, router } = await setup()
    const del = () => wrapper.findAll('button').find((b) => b.text().includes('Hapus'))!.trigger('click')

    vi.mocked(showConfirmDialog).mockResolvedValueOnce(false)
    await del()
    await flushPromises()
    expect(api.deleteCashFlow).not.toHaveBeenCalled()

    await del()
    await flushPromises()
    expect(api.deleteCashFlow).toHaveBeenCalledWith('4')
    expect(router.currentRoute.value.path).toBe('/')

    vi.mocked(api.deleteCashFlow).mockRejectedValue(new Error('Gagal hapus'))
    await del()
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal hapus')
  })

  it('error store null pada hapus memakai string kosong', async () => {
    const { wrapper, pinia } = await setup()
    useCashFlowsStore(pinia).deleteCashFlow = vi.fn().mockResolvedValue(false)
    await wrapper.findAll('button').find((b) => b.text().includes('Hapus'))!.trigger('click')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('')
  })
})
