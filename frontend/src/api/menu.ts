import { api } from './client'
import { MenuItem, CreateMenuItemRequest } from '../types'

export const fetchMenu = async (): Promise<MenuItem[]> =>
  (await api.get<MenuItem[]>('/menu')).data

export const searchMenu = async (query: string): Promise<MenuItem[]> =>
  (await api.get<MenuItem[]>(`/menu/search?q=${encodeURIComponent(query)}`)).data

export const getMenuItem = async (id: number): Promise<MenuItem> =>
  (await api.get<MenuItem>(`/menu/${id}`)).data

export const createMenuItem = async (data: CreateMenuItemRequest): Promise<MenuItem> =>
  (await api.post<MenuItem>('/menu/admin', data)).data

export const toggleAvailability = async (id: number, available: boolean): Promise<MenuItem> =>
  (await api.patch<MenuItem>(`/menu/admin/${id}/availability?available=${available}`)).data

export const fetchAllMenu = async (): Promise<MenuItem[]> =>
  (await api.get<MenuItem[]>('/menu/admin/all')).data

export const deleteMenuItem = async (id: number): Promise<void> => {
  await api.delete(`/menu/admin/${id}`)
}