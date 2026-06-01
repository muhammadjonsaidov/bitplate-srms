import { api } from './client'
import { AuthResponse } from '../types'

export const login = async (data: { username: string; password: string }): Promise<AuthResponse> =>
  (await api.post<AuthResponse>('/auth/login', data)).data

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}
