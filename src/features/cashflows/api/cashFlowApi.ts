import { apiFetch } from '../../../helpers/apiHelper'
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  PeriodStats,
  RawCashFlowStats,
} from '../states/cashFlowsStore'

export interface PeriodParams {
  end_date?: string
  total_data?: number
}

export function getCashFlows(params: CashFlowQueryParams = {}) {
  return apiFetch<{ cash_flows: CashFlow[]; stats: RawCashFlowStats }>('/cash-flows', {
    query: { ...params },
  })
}

export function getCashFlow(id: number | string) {
  return apiFetch<{ cash_flow: CashFlow }>(`/cash-flows/${id}`)
}

export function addCashFlow(payload: CashFlowPayload) {
  return apiFetch<{ cash_flow_id: number }>('/cash-flows', { method: 'POST', body: payload })
}

export function updateCashFlow(id: number | string, payload: CashFlowPayload) {
  return apiFetch<null>(`/cash-flows/${id}`, { method: 'PUT', body: payload })
}

export function deleteCashFlow(id: number | string) {
  return apiFetch<null>(`/cash-flows/${id}`, { method: 'DELETE' })
}

export function getLabels() {
  return apiFetch<{ labels: string[] }>('/cash-flows/labels')
}

export function getDailyStats(params: PeriodParams = {}) {
  return apiFetch<PeriodStats>('/cash-flows/stats/daily', { query: { ...params } })
}

export function getMonthlyStats(params: PeriodParams = {}) {
  return apiFetch<PeriodStats>('/cash-flows/stats/monthly', { query: { ...params } })
}

export function deleteAllCashFlows() {
  return apiFetch<null>('/cash-flows', { method: 'DELETE' })
}
