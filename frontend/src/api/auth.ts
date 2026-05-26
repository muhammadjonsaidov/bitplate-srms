import { apiClient } from './client'
import { AuthResponse } from '../types'

export const login = async (data: { username: string; password: string }): Promise<AuthResponse> =>
  (await apiClient.post<AuthResponse>('/auth/login', data)).data

export const logout = async (): Promise<void> => { await apiClient.post('/auth/logout') }
