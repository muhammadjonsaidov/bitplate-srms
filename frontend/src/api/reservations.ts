import { apiClient } from './client'
import { Reservation } from '../types'

export const fetchReservations = async (): Promise<Reservation[]> =>
  (await apiClient.get<Reservation[]>('/reservations')).data

export const fetchReservationsByRange = async (from: string, to: string): Promise<Reservation[]> =>
  (await apiClient.get<Reservation[]>('/reservations/range', { params: { from, to } })).data

export const createReservation = async (data: {
  tableId: number
  customerName: string
  customerPhone?: string
  partySize: number
  scheduledAt: string
}): Promise<Reservation> =>
  (await apiClient.post<Reservation>('/reservations', data)).data

export const checkInReservation = async (id: number): Promise<Reservation> =>
  (await apiClient.put<Reservation>(`/reservations/${id}/check-in`)).data

export const cancelReservation = async (id: number): Promise<void> => {
  await apiClient.delete(`/reservations/${id}`)
}
