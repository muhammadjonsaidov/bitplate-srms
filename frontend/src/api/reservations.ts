import { api } from './client'
import { Reservation, CreateReservationRequest } from '../types'

export const fetchReservations = async (): Promise<Reservation[]> =>
  (await api.get<Reservation[]>('/reservations')).data

export const fetchReservationsByRange = async (from: string, to: string): Promise<Reservation[]> =>
  (await api.get<Reservation[]>(`/reservations/range?from=${from}&to=${to}`)).data

export const createReservation = async (data: CreateReservationRequest): Promise<Reservation> =>
  (await api.post<Reservation>('/reservations', data)).data

export const checkInReservation = async (id: number): Promise<Reservation> =>
  (await api.put<Reservation>(`/reservations/${id}/check-in`)).data

export const cancelReservation = async (id: number): Promise<void> => {
  await api.delete(`/reservations/${id}`)
}
