import { apiClient } from './client'
import { MenuItem } from '../types'

export const fetchMenu = async (): Promise<MenuItem[]> =>
  (await apiClient.get<MenuItem[]>('/menu')).data

export const searchMenu = async (q: string): Promise<MenuItem[]> =>
  (await apiClient.get<MenuItem[]>('/menu/search', { params: { q } })).data

export const fetchMenuItem = async (id: number): Promise<MenuItem> =>
  (await apiClient.get<MenuItem>(`/menu/${id}`)).data

export const createMenuItem = async (data: {
  category: string
  name: string
  description: string
  price: number
}): Promise<MenuItem> =>
  (await apiClient.post<MenuItem>('/menu/admin', data)).data

export const toggleMenuItemAvailability = async (
  id: number,
  available: boolean
): Promise<MenuItem> =>
  (await apiClient.patch<MenuItem>(`/menu/admin/${id}/availability`, null, { params: { available } })).data

export const fetchAllMenuItems = async (): Promise<MenuItem[]> =>
  (await apiClient.get<MenuItem[]>('/menu/admin/all')).data

export const deleteMenuItem = async (id: number): Promise<void> => {
  await apiClient.delete(`/menu/admin/${id}`)
}
