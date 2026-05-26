import { apiClient } from './client'
import { Table } from '../types'

export const fetchTables = async (): Promise<Table[]> => (await apiClient.get<Table[]>('/tables')).data
export const seatCustomer = async (id: number) => (await apiClient.put<Table>(`/tables/${id}/seat`)).data
export const requestBill = async (id: number) => (await apiClient.put<Table>(`/tables/${id}/request-bill`)).data
export const clearTable = async (id: number) => (await apiClient.put<Table>(`/tables/${id}/clear`)).data
