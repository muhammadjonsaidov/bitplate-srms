import { api } from './client'
import { Order } from '../types'

export const fetchKitchenQueue = async (): Promise<Order[]> =>
  (await api.get<Order[]>('/kitchen/queue')).data

export const prepareOrder = async (id: number): Promise<Order> =>
  (await api.put<Order>(`/kitchen/orders/${id}/prepare`)).data

export const markOrderReady = async (id: number): Promise<Order> =>
  (await api.put<Order>(`/kitchen/orders/${id}/ready`)).data

export const cancelOrder = async (id: number): Promise<Order> =>
  (await api.put<Order>(`/kitchen/orders/${id}/cancel`)).data

export const markServed = async (id: number): Promise<Order> =>
  (await api.put<Order>(`/kitchen/orders/${id}/served`)).data

export const undoLastAction = async (): Promise<{ message: string }> =>
  (await api.post<{ message: string }>('/kitchen/undo')).data
