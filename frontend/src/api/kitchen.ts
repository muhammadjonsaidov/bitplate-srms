import { apiClient } from './client'
import { Order } from '../types'

export const fetchKitchenQueue = async (): Promise<Order[]> => (await apiClient.get<Order[]>('/kitchen/queue')).data
export const prepareOrder = async (id: number): Promise<Order> => (await apiClient.put<Order>(`/kitchen/orders/${id}/prepare`)).data
export const markOrderReady = async (id: number): Promise<Order> => (await apiClient.put<Order>(`/kitchen/orders/${id}/ready`)).data
export const cancelOrder = async (id: number): Promise<Order> => (await apiClient.put<Order>(`/kitchen/orders/${id}/cancel`)).data
export const undoLastAction = async (): Promise<{ message: string }> => (await apiClient.post('/kitchen/undo')).data
