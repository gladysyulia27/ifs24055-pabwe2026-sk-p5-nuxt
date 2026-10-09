import { defineStore } from 'pinia'
import { getErrorMessage } from '../../../helpers/apiHelper'
import type { AuthUser } from '../../auth/api/authApi'
import {
  changePassword as changePasswordRequest,
  getMe,
  getUsers,
  updateMe,
  uploadPhoto as uploadPhotoRequest,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
} from '../api/userApi'

export interface UsersState {
  users: AuthUser[]
  profile: AuthUser | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

async function run(
  state: UsersState,
  busyKey: 'isLoading' | 'isSaving',
  task: () => Promise<void>,
): Promise<boolean> {
  state[busyKey] = true
  state.error = null
  try {
    await task()
    return true
  } catch (error) {
    state.error = getErrorMessage(error)
    return false
  } finally {
    state[busyKey] = false
  }
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isLoading: false,
    isSaving: false,
    error: null,
  }),
  actions: {
    fetchUsers() {
      return run(this, 'isLoading', async () => {
        this.users = (await getUsers()).data.users
      })
    },
    fetchProfile() {
      return run(this, 'isLoading', async () => {
        this.profile = (await getMe()).data.user
      })
    },
    updateProfile(payload: UpdateProfilePayload) {
      return run(this, 'isSaving', async () => {
        this.profile = (await updateMe(payload)).data.user
      })
    },
    uploadPhoto(file: File) {
      return run(this, 'isSaving', async () => {
        await uploadPhotoRequest(file)
        this.profile = (await getMe()).data.user
      })
    },
    changePassword(payload: ChangePasswordPayload) {
      return run(this, 'isSaving', async () => {
        await changePasswordRequest(payload)
      })
    },
    reset() {
      this.users = []
      this.profile = null
      this.error = null
    },
  },
})
