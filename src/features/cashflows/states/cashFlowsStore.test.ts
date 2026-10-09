import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockPinia } from '../../../test-utils'
import * as api from '../api/cashFlowApi'
import { emptyStats, toCashFlowStats, useCashFlowsStore, type CashFlowPayload } from './cashFlowsStore'

vi.mock('../api/cashFlowApi')

const ok = <T>(data: T) => ({ status: 'success', message: '', data })
const item = { id: 1, user_id: 1, type: 'inflow', source: 'cash', label: 'gaji', description: '', nominal: 100, created_at: '', updated_at: '' } as const
const payload: CashFlowPayload = { type: 'inflow', source: 'cash', label: 'gaji', nominal: 100, description: '' }
const period = { stats_inflow: { a: 1 }, stats_outflow: { a: 2 }, stats_cashflow: { a: -1 } }

describe('cashFlowsStore', () => {
  beforeEach(() => createMockPinia())

  it('toCashFlowStats menghitung saldo per sumber dan menangani key kosong', () => {
    expect(toCashFlowStats({})).toEqual(emptyStats())
    expect(
      toCashFlowStats({
        cashflow: 2000, total_inflow: 2500, total_outflow: 500,
        total_inflow_cash: 2500, total_outflow_cash: 100,
        total_outflow_savings: 400, total_inflow_loans: 50,
      }),
    ).toEqual({ cashflow: 2000, total_inflow: 2500, total_outflow: 500, cash: 2400, savings: -400, loans: 50 })
  })

  it('fetchCashFlows mengisi data dan statistik; gagal menyimpan error', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: [item], stats: { cashflow: 100, total_inflow: 100 } }))
    expect(await store.fetchCashFlows({ type: 'inflow' })).toBe(true)
    expect(api.getCashFlows).toHaveBeenCalledWith({ type: 'inflow' })
    expect(store.cashFlows).toEqual([item])
    expect(store.stats.cashflow).toBe(100)
    expect(await (async () => { vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: [], stats: {} })); return store.fetchCashFlows() })()).toBe(true)
    expect(api.getCashFlows).toHaveBeenLastCalledWith({})

    vi.mocked(api.getCashFlows).mockRejectedValue(new Error('gagal'))
    expect(await store.fetchCashFlows()).toBe(false)
    expect(store.error).toBe('gagal')
    expect(store.isLoading).toBe(false)
  })

  it('fetchCashFlow mereset detail lebih dulu', async () => {
    const store = useCashFlowsStore()
    store.cashFlow = { ...item }
    vi.mocked(api.getCashFlow).mockRejectedValue(new Error('tidak ada'))
    expect(await store.fetchCashFlow(9)).toBe(false)
    expect(store.cashFlow).toBeNull()
    vi.mocked(api.getCashFlow).mockResolvedValue(ok({ cash_flow: item }))
    expect(await store.fetchCashFlow(1)).toBe(true)
    expect(store.cashFlow).toEqual(item)
  })

  it('fetchLabels, fetchDailyStats, fetchMonthlyStats', async () => {
    const store = useCashFlowsStore()
    vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: ['gaji'] }))
    vi.mocked(api.getDailyStats).mockResolvedValue(ok(period))
    vi.mocked(api.getMonthlyStats).mockResolvedValue(ok(period))
    await store.fetchLabels()
    await store.fetchDailyStats()
    await store.fetchMonthlyStats()
    expect(store.labels).toEqual(['gaji'])
    expect(api.getDailyStats).toHaveBeenCalledWith({ total_data: 7 })
    expect(api.getMonthlyStats).toHaveBeenCalledWith({ total_data: 12 })
    expect(store.dailyStats).toEqual(period)
    expect(store.monthlyStats).toEqual(period)
    await store.fetchDailyStats(3)
    await store.fetchMonthlyStats(6)
    expect(api.getDailyStats).toHaveBeenLastCalledWith({ total_data: 3 })
    expect(api.getMonthlyStats).toHaveBeenLastCalledWith({ total_data: 6 })
  })

  it('addCashFlow mengatur flag add/added', async () => {
    const store = useCashFlowsStore()
    let busyDuring = false
    vi.mocked(api.addCashFlow).mockImplementation(async () => {
      busyDuring = store.isCashFlowAdd
      return ok({ cash_flow_id: 1 })
    })
    expect(await store.addCashFlow(payload)).toBe(true)
    expect(busyDuring).toBe(true)
    expect(store.isCashFlowAdd).toBe(false)
    expect(store.isCashFlowAdded).toBe(true)

    vi.mocked(api.addCashFlow).mockRejectedValue(new Error('invalid'))
    expect(await store.addCashFlow(payload)).toBe(false)
    expect(store.isCashFlowAdded).toBe(false)
    expect(store.error).toBe('invalid')
  })

  it('changeCashFlow, deleteCashFlow, deleteAllCashFlows', async () => {
    const store = useCashFlowsStore()
    const done = ok(null)
    vi.mocked(api.updateCashFlow).mockResolvedValue(done)
    vi.mocked(api.deleteCashFlow).mockResolvedValue(done)
    vi.mocked(api.deleteAllCashFlows).mockResolvedValue(done)
    expect(await store.changeCashFlow(1, payload)).toBe(true)
    expect(api.updateCashFlow).toHaveBeenCalledWith(1, payload)
    expect(await store.deleteCashFlow(1)).toBe(true)
    expect(await store.deleteAllCashFlows()).toBe(true)
    expect(store.isCashFlowChanged && store.isCashFlowDeleted && store.isCashFlowDeletedAll).toBe(true)

    vi.mocked(api.updateCashFlow).mockRejectedValue(new Error('a'))
    vi.mocked(api.deleteCashFlow).mockRejectedValue(new Error('b'))
    vi.mocked(api.deleteAllCashFlows).mockRejectedValue(new Error('c'))
    expect(await store.changeCashFlow(1, payload)).toBe(false)
    expect(await store.deleteCashFlow(1)).toBe(false)
    expect(await store.deleteAllCashFlows()).toBe(false)
    expect(store.error).toBe('c')
    expect(store.isCashFlowChange || store.isCashFlowDelete || store.isCashFlowDeleteAll).toBe(false)
  })

  it('resetMutationStatus dan reset', () => {
    const store = useCashFlowsStore()
    Object.assign(store, { isCashFlowAdded: true, isCashFlowChanged: true, isCashFlowDeleted: true, isCashFlowDeletedAll: true, labels: ['x'] })
    store.resetMutationStatus()
    expect([store.isCashFlowAdded, store.isCashFlowChanged, store.isCashFlowDeleted, store.isCashFlowDeletedAll]).toEqual([false, false, false, false])
    store.reset()
    expect(store.labels).toEqual([])
  })
})
