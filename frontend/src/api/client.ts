import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const { accessToken, staff } = res.data
        useAuthStore.getState().setAuth(accessToken, staff)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
