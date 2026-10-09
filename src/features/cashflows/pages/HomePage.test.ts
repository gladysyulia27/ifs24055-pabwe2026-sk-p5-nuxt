import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'
import { renderWithProviders } from '../../../test-utils'
import * as api from '../api/cashFlowApi'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import HomePage from './HomePage.vue'

vi.mock('../api/cashFlowApi')
vi.mock('../../../helpers/toolsHelper', async (orig) => ({
  ...(await orig<typeof import('../../../helpers/toolsHelper')>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const ok = <T>(data: T) => ({ status: 'success', message: '', data })
const rows = [
  { id: 4, user_id: 1, type: 'outflow', source: 'savings', label: 'alat-elektronik', description: 'Keyboard', nominal: 400000, created_at: '2024-10-05T12:09:16.000000Z', updated_at: '' },
  { id: 2, user_id: 1, type: 'inflow', source: 'cash', label: 'gaji', description: 'Gaji', nominal: 2500000, created_at: '2024-10-05T11:26:45.000000Z', updated_at: '' },
] as const
const stats = { cashflow: 2100000, total_inflow: 2500000, total_outflow: 400000, total_inflow_cash: 2500000, total_outflow_savings: 400000 }
const period = (key: string) => ({ stats_inflow: { [key]: 2500000 }, stats_outflow: { [key]: 400000 }, stats_cashflow: { [key]: 2100000 } })

function mockApi() {
  vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: [...rows], stats }))
  vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: ['gaji', 'alat-elektronik'] }))
  vi.mocked(api.getDailyStats).mockResolvedValue(ok(period('05-10-2024')))
  vi.mocked(api.getMonthlyStats).mockResolvedValue(ok(period('10-2024')))
}
async function setup() {
  const result = await renderWithProviders(HomePage)
  await flushPromises()
  return result
}
const rupiah = (text: string) => text.replace(/\s/g, ' ')

describe('HomePage', () => {
  beforeEach(() => {
    mockApi()
    vi.mocked(showConfirmDialog).mockResolvedValue(true)
    vi.mocked(showErrorDialog).mockResolvedValue()
    vi.mocked(showSuccessDialog).mockResolvedValue()
  })

  it('menampilkan kartu metrik, tabel, dan kartu transaksi', async () => {
    const { wrapper } = await setup()
    expect(rupiah(wrapper.get('[data-testid="metric-cashflow"]').text())).toContain('Rp 2.100.000')
    expect(rupiah(wrapper.get('[data-testid="metric-inflow"]').text())).toContain('Rp 2.500.000')
    expect(rupiah(wrapper.get('[data-testid="metric-outflow"]').text())).toContain('Rp 400.000')
    expect(rupiah(wrapper.get('[data-testid="metric-cash"]').text())).toContain('Rp 2.500.000')
    expect(rupiah(wrapper.get('[data-testid="metric-savings"]').text())).toContain('-Rp 400.000')
    expect(wrapper.find('[data-testid="metric-loans"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="cashflow-row"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-testid="cashflow-card"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Tabungan')
  })

  it('menampilkan tren harian dan bulanan', async () => {
    const { wrapper } = await setup()
    expect(wrapper.get('[data-testid="trend-chart"]').text()).toContain('05-10-2024')
    const [daily, monthly] = wrapper.findAll('button').filter((b) => ['Harian', 'Bulanan'].includes(b.text()))
    await monthly.trigger('click')
    expect(wrapper.get('[data-testid="trend-chart"]').text()).toContain('10-2024')
    await daily.trigger('click')
    expect(wrapper.get('[data-testid="trend-chart"]').text()).toContain('05-10-2024')
  })

  it('menampilkan placeholder bila belum ada data tren', async () => {
    const { wrapper, pinia } = await setup()
    const store = useCashFlowsStore(pinia)
    store.dailyStats = null
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Belum ada data tren')
  })

  it('menerapkan dan mereset filter (termasuk rentang tanggal)', async () => {
    const { wrapper } = await setup()
    await wrapper.get('#f-type').setValue('inflow')
    await wrapper.get('#f-source').setValue('cash')
    await wrapper.get('#f-label').setValue('gaji')
    await wrapper.get('#f-start').setValue('2024-10-01')
    await wrapper.get('#f-end').setValue('2024-10-05')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(api.getCashFlows).toHaveBeenLastCalledWith({
      type: 'inflow', source: 'cash', label: 'gaji', start_date: '2024-10-01 00:00:00', end_date: '2024-10-05 23:59:59',
    })
    await wrapper.get('button[aria-label="Reset filter"]').trigger('click')
    await flushPromises()
    expect(api.getCashFlows).toHaveBeenLastCalledWith({ type: '', source: '', label: '', start_date: undefined, end_date: undefined })
    expect((wrapper.get('#f-type').element as HTMLSelectElement).value).toBe('')
  })

  it('menampilkan state loading, error, dan kosong', async () => {
    const { wrapper, pinia } = await setup()
    const store = useCashFlowsStore(pinia)
    store.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Memuat data')
    store.isLoading = false
    store.error = 'Gagal memuat'
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[role="alert"]').text()).toBe('Gagal memuat')
    store.error = null
    store.cashFlows = []
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Belum ada transaksi')
  })

  it('menambah transaksi lewat modal dan memuat ulang data', async () => {
    vi.mocked(api.addCashFlow).mockResolvedValue(ok({ cash_flow_id: 9 }))
    const { wrapper } = await setup()
    await wrapper.findAll('button').find((b) => b.text().includes('Tambah Transaksi'))!.trigger('click')
    await wrapper.get('#cf-label').setValue('bonus')
    await wrapper.get('#cf-nominal').setValue('1000')
    const before = vi.mocked(api.getCashFlows).mock.calls.length
    await wrapper.get('[role="dialog"] form').trigger('submit')
    await flushPromises()
    expect(api.addCashFlow).toHaveBeenCalled()
    expect(vi.mocked(api.getCashFlows).mock.calls.length).toBe(before + 1)
  })

  it('mengubah transaksi (tabel dan kartu) lewat modal', async () => {
    vi.mocked(api.updateCashFlow).mockResolvedValue(ok(null))
    const { wrapper } = await setup()
    await wrapper.get('button[aria-label="Ubah"]').trigger('click')
    expect((wrapper.get('#cf-label').element as HTMLInputElement).value).toBe('alat-elektronik')
    await wrapper.get('[role="dialog"] form').trigger('submit')
    await flushPromises()
    expect(api.updateCashFlow).toHaveBeenCalledWith(4, expect.objectContaining({ label: 'alat-elektronik' }))
    await wrapper.findAll('[data-testid="cashflow-card"] button').find((b) => b.text() === 'Ubah')!.trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('menghapus satu transaksi: batal, sukses, gagal', async () => {
    vi.mocked(api.deleteCashFlow).mockResolvedValue(ok(null))
    const { wrapper } = await setup()
    const del = () => wrapper.get('button[aria-label="Hapus"]').trigger('click')

    vi.mocked(showConfirmDialog).mockResolvedValueOnce(false)
    await del()
    await flushPromises()
    expect(api.deleteCashFlow).not.toHaveBeenCalled()

    await del()
    await flushPromises()
    expect(api.deleteCashFlow).toHaveBeenCalledWith(4)
    expect(showSuccessDialog).toHaveBeenCalledWith('Catatan arus kas berhasil dihapus.')

    vi.mocked(api.deleteCashFlow).mockRejectedValue(new Error('Gagal hapus'))
    await wrapper.findAll('[data-testid="cashflow-card"] button').find((b) => b.text() === 'Hapus')!.trigger('click')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal hapus')
  })

  it('mereset seluruh transaksi: batal, sukses, gagal', async () => {
    vi.mocked(api.deleteAllCashFlows).mockResolvedValue(ok(null))
    const { wrapper } = await setup()
    const resetAll = () => wrapper.findAll('button').find((b) => b.text().includes('Reset Semua'))!.trigger('click')

    vi.mocked(showConfirmDialog).mockResolvedValueOnce(false)
    await resetAll()
    await flushPromises()
    expect(api.deleteAllCashFlows).not.toHaveBeenCalled()

    await resetAll()
    await flushPromises()
    expect(api.deleteAllCashFlows).toHaveBeenCalled()
    expect(showSuccessDialog).toHaveBeenCalledWith('Seluruh catatan arus kas berhasil dihapus.')

    vi.mocked(api.deleteAllCashFlows).mockRejectedValue(new Error('Gagal reset'))
    await resetAll()
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal reset')
  })

  it('error store null pada hapus memakai string kosong', async () => {
    const { wrapper, pinia } = await setup()
    const store = useCashFlowsStore(pinia)
    store.deleteCashFlow = vi.fn().mockResolvedValue(false)
    store.deleteAllCashFlows = vi.fn().mockResolvedValue(false)
    await wrapper.get('button[aria-label="Hapus"]').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find((b) => b.text().includes('Reset Semua'))!.trigger('click')
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledTimes(2)
    expect(showErrorDialog).toHaveBeenLastCalledWith('')
  })
})
