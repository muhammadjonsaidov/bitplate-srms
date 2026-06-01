import { apiClient } from './client'
import { Bill } from '../types'

export const generateBill = async (orderId: number, strategy = 'STANDARD'): Promise<Bill> =>
  (await apiClient.post<Bill>(`/billing/generate/${orderId}`, null, { params: { strategy } })).data

export const getBillForOrder = async (orderId: number): Promise<Bill> =>
  (await apiClient.get<Bill>(`/billing/order/${orderId}`)).data

export const applyTip = async (billId: number, tip: number): Promise<Bill> =>
  (await apiClient.put<Bill>(`/billing/${billId}/tip`, null, { params: { tip } })).data

export const splitBill = async (billId: number, guests: number): Promise<Bill> =>
  (await apiClient.put<Bill>(`/billing/${billId}/split`, null, { params: { guests } })).data

export const markBillPaid = async (billId: number): Promise<Bill> =>
  (await apiClient.put<Bill>(`/billing/${billId}/pay`)).data
