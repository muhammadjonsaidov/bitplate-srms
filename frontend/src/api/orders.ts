import { api } from './client'
import { Order, OrderStatus } from '../types'

export const createOrder = async (data: { tableId: number }): Promise<Order> =>
  (await api.post<Order>('/orders', data)).data

export const addItemToOrder = async (
  orderId: number,
  data: { menuItemId: number; quantity: number; customisations?: string }
): Promise<Order> =>
  (await api.post<Order>(`/orders/${orderId}/items`, data)).data

export const removeItemFromOrder = async (orderId: number, itemId: number): Promise<Order> =>
  (await api.delete<Order>(`/orders/${orderId}/items/${itemId}`)).data

export const submitOrder = async (orderId: number): Promise<Order> =>
  (await api.put<Order>(`/orders/${orderId}/submit`)).data

export const getOrder = async (id: number): Promise<Order> =>
  (await api.get<Order>(`/orders/${id}`)).data

export const fetchActiveOrders = async (): Promise<Order[]> =>
  (await api.get<Order[]>('/orders/active')).data

export const fetchOrdersByTable = async (tableId: number): Promise<Order[]> =>
  (await api.get<Order[]>(`/orders/table/${tableId}`)).data

export const fetchOrdersByStatus = async (status: OrderStatus): Promise<Order[]> =>
  (await api.get<Order[]>(`/orders?status=${status}`)).data
