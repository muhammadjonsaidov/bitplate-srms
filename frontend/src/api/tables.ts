import { api } from './client'
import { Table } from '../types'

export const fetchTables = async (): Promise<Table[]> =>
  (await api.get<Table[]>('/tables')).data

export const getTable = async (id: number): Promise<Table> =>
  (await api.get<Table>(`/tables/${id}`)).data

export const seatCustomer = async (id: number): Promise<Table> =>
  (await api.put<Table>(`/tables/${id}/seat`)).data

export const reserveTable = async (id: number): Promise<Table> =>
  (await api.put<Table>(`/tables/${id}/reserve`)).data

export const requestBill = async (id: number): Promise<Table> =>
  (await api.put<Table>(`/tables/${id}/request-bill`)).data

export const clearTable = async (id: number): Promise<Table> =>
  (await api.put<Table>(`/tables/${id}/clear`)).data
