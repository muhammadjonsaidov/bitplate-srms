import { apiClient } from './client'
import { Order } from '../types'

export const createOrder = async (data: { tableId: number }): Promise<Order> =>
  (await apiClient.post<Order>('/orders', data)).data

export const addItemToOrder = async (orderId: number, data: { menuItemId: number; quantity: number; customisations?: string }): Promise<Order> =>
  (await apiClient.post<Order>(`/orders/${orderId}/items`, data)).data

export const submitOrder = async (orderId: number): Promise<Order> =>
  (await apiClient.put<Order>(`/orders/${orderId}/submit`)).data

export const fetchActiveOrders = async (): Promise<Order[]> =>
  (await apiClient.get<Order[]>('/orders/active')).data

export const fetchOrdersByTable = async (tableId: number): Promise<Order[]> =>
  (await apiClient.get<Order[]>(`/orders/table/${tableId}`)).data
