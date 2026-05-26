import { create } from 'zustand'
import { Staff } from '../types'

interface AuthState {
  accessToken: string | null
  staff: Staff | null
  isAuthenticated: boolean
  setAuth: (token: string, staff: Staff) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  staff: null,
  isAuthenticated: false,
  setAuth: (accessToken, staff) => set({ accessToken, staff, isAuthenticated: true }),
  clearAuth: () => set({ accessToken: null, staff: null, isAuthenticated: false }),
}))
