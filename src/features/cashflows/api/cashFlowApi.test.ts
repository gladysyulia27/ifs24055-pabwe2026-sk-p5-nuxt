import { describe, expect, it, vi } from 'vitest'
import * as apiHelper from '../../../helpers/apiHelper'
import {
  addCashFlow, deleteAllCashFlows, deleteCashFlow, getCashFlow, getCashFlows, getDailyStats, getLabels,
  getMonthlyStats, updateCashFlow,
} from './cashFlowApi'

vi.mock('../../../helpers/apiHelper', () => ({ apiFetch: vi.fn().mockResolvedValue({}) }))
const apiFetch = apiHelper.apiFetch as unknown as ReturnType<typeof vi.fn>
const payload = { type: 'inflow', source: 'cash', label: 'gaji', nominal: 1, description: 'x' } as const

describe('cashFlowApi', () => {
  it('getCashFlows mengirim filter sebagai query (default kosong)', async () => {
    await getCashFlows()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows', { query: {} })
    await getCashFlows({ type: 'outflow', source: 'loans', label: 'x', start_date: 'a', end_date: 'b' })
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows', {
      query: { type: 'outflow', source: 'loans', label: 'x', start_date: 'a', end_date: 'b' },
    })
  })

  it('detail, tambah, ubah, hapus', async () => {
    await getCashFlow(4)
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/4')
    await addCashFlow(payload)
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows', { method: 'POST', body: payload })
    await updateCashFlow('4', payload)
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/4', { method: 'PUT', body: payload })
    await deleteCashFlow(4)
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/4', { method: 'DELETE' })
  })

  it('labels dan statistik', async () => {
    await getLabels()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/labels')
    await getDailyStats()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/daily', { query: {} })
    await getDailyStats({ total_data: 7, end_date: 'x' })
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/daily', { query: { total_data: 7, end_date: 'x' } })
    await getMonthlyStats()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/monthly', { query: {} })
    await getMonthlyStats({ total_data: 12 })
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows/stats/monthly', { query: { total_data: 12 } })
  })

  it('deleteAllCashFlows memakai DELETE /cash-flows', async () => {
    await deleteAllCashFlows()
    expect(apiFetch).toHaveBeenLastCalledWith('/cash-flows', { method: 'DELETE' })
  })
})
