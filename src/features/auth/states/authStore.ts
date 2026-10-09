import { defineStore } from 'pinia'
import { getAccessToken, getErrorMessage, putAccessToken } from '../../../helpers/apiHelper'
import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '../api/authApi'

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: getAccessToken(),
    isLoading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
  actions: {
    async login(payload: LoginPayload): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await loginRequest(payload)
        putAccessToken(data.token)
        this.token = data.token
        this.user = data.user
        return true
      } catch (error) {
        this.error = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async register(payload: RegisterPayload): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        await registerRequest(payload)
        return true
      } catch (error) {
        this.error = getErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    logout(): void {
      putAccessToken(null)
      this.token = null
      this.user = null
      this.error = null
    },
  },
})
