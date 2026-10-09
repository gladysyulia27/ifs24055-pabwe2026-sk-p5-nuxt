import { defineStore } from 'pinia'
import { getErrorMessage } from '../../../helpers/apiHelper'
import {
  addCashFlow as addRequest,
  deleteAllCashFlows as deleteAllRequest,
  deleteCashFlow as deleteRequest,
  getCashFlow,
  getCashFlows,
  getDailyStats,
  getLabels,
  getMonthlyStats,
  updateCashFlow as updateRequest,
} from '../api/cashFlowApi'

export type CashFlowType = 'inflow' | 'outflow'
export type CashFlowSource = 'cash' | 'savings' | 'loans'

export interface CashFlow {
  id: number
  user_id: number
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
  created_at: string
  updated_at: string
}

export interface CashFlowPayload {
  type: CashFlowType
  source: CashFlowSource
  label: string
  nominal: number
  description: string
}

export interface CashFlowQueryParams {
  type?: CashFlowType | ''
  source?: CashFlowSource | ''
  label?: string
  start_date?: string
  end_date?: string
}

/** Respons mentah `stats` dari API, mis. { cashflow, total_inflow, total_inflow_cash, ... } */
export type RawCashFlowStats = Record<string, number>

export interface CashFlowStats {
  /** Saldo kas bersih (inflow - outflow) */
  cashflow: number
  total_inflow: number
  total_outflow: number
  /** Saldo bersih per sumber dana (inflow - outflow) */
  cash: number
  savings: number
  loans: number
}

export interface PeriodStats {
  stats_inflow: Record<string, number>
  stats_outflow: Record<string, number>
  stats_cashflow: Record<string, number>
}

export interface CashFlowsState {
  cashFlows: CashFlow[]
  cashFlow: CashFlow | null
  stats: CashFlowStats
  labels: string[]
  dailyStats: PeriodStats | null
  monthlyStats: PeriodStats | null
  isLoading: boolean
  error: string | null
  isCashFlowAdd: boolean
  isCashFlowAdded: boolean
  isCashFlowChange: boolean
  isCashFlowChanged: boolean
  isCashFlowDelete: boolean
  isCashFlowDeleted: boolean
  isCashFlowDeleteAll: boolean
  isCashFlowDeletedAll: boolean
}

type BusyKey = 'isCashFlowAdd' | 'isCashFlowChange' | 'isCashFlowDelete' | 'isCashFlowDeleteAll'
type DoneKey = 'isCashFlowAdded' | 'isCashFlowChanged' | 'isCashFlowDeleted' | 'isCashFlowDeletedAll'

export function emptyStats(): CashFlowStats {
  return { cashflow: 0, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 0 }
}

export function toCashFlowStats(raw: RawCashFlowStats): CashFlowStats {
  const n = (key: string) => Number(raw[key]) || 0
  return {
    cashflow: n('cashflow'),
    total_inflow: n('total_inflow'),
    total_outflow: n('total_outflow'),
    cash: n('total_inflow_cash') - n('total_outflow_cash'),
    savings: n('total_inflow_savings') - n('total_outflow_savings'),
    loans: n('total_inflow_loans') - n('total_outflow_loans'),
  }
}

async function load(state: CashFlowsState, task: () => Promise<void>): Promise<boolean> {
  state.isLoading = true
  state.error = null
  try {
    await task()
    return true
  } catch (error) {
    state.error = getErrorMessage(error)
    return false
  } finally {
    state.isLoading = false
  }
}

async function mutate(
  state: CashFlowsState,
  busyKey: BusyKey,
  doneKey: DoneKey,
  task: () => Promise<unknown>,
): Promise<boolean> {
  state[busyKey] = true
  state[doneKey] = false
  state.error = null
  try {
    await task()
    state[doneKey] = true
    return true
  } catch (error) {
    state.error = getErrorMessage(error)
    return false
  } finally {
    state[busyKey] = false
  }
}

export const useCashFlowsStore = defineStore('cashFlows', {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    dailyStats: null,
    monthlyStats: null,
    isLoading: false,
    error: null,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    fetchCashFlows(params: CashFlowQueryParams = {}) {
      return load(this, async () => {
        const { data } = await getCashFlows(params)
        this.cashFlows = data.cash_flows
        this.stats = toCashFlowStats(data.stats)
      })
    },
    fetchCashFlow(id: number | string) {
      this.cashFlow = null
      return load(this, async () => {
        this.cashFlow = (await getCashFlow(id)).data.cash_flow
      })
    },
    fetchLabels() {
      return load(this, async () => {
        this.labels = (await getLabels()).data.labels
      })
    },
    fetchDailyStats(totalData = 7) {
      return load(this, async () => {
        this.dailyStats = (await getDailyStats({ total_data: totalData })).data
      })
    },
    fetchMonthlyStats(totalData = 12) {
      return load(this, async () => {
        this.monthlyStats = (await getMonthlyStats({ total_data: totalData })).data
      })
    },
    addCashFlow(payload: CashFlowPayload) {
      return mutate(this, 'isCashFlowAdd', 'isCashFlowAdded', () => addRequest(payload))
    },
    changeCashFlow(id: number | string, payload: CashFlowPayload) {
      return mutate(this, 'isCashFlowChange', 'isCashFlowChanged', () => updateRequest(id, payload))
    },
    deleteCashFlow(id: number | string) {
      return mutate(this, 'isCashFlowDelete', 'isCashFlowDeleted', () => deleteRequest(id))
    },
    deleteAllCashFlows() {
      return mutate(this, 'isCashFlowDeleteAll', 'isCashFlowDeletedAll', () => deleteAllRequest())
    },
    resetMutationStatus() {
      this.isCashFlowAdded = false
      this.isCashFlowChanged = false
      this.isCashFlowDeleted = false
      this.isCashFlowDeletedAll = false
    },
    reset() {
      this.$reset()
    },
  },
})
