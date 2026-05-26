import { apiClient } from './client'
import { Bill } from '../types'

export const generateBill = async (orderId: number, strategy = 'STANDARD'): Promise<Bill> =>
  (await apiClient.post<Bill>(`/billing/generate/${orderId}?strategy=${strategy}`)).data

export const applyTip = async (billId: number, tip: number): Promise<Bill> =>
  (await apiClient.put<Bill>(`/billing/${billId}/tip?tip=${tip}`)).data

export const splitBill = async (billId: number, guests: number): Promise<Bill> =>
  (await apiClient.put<Bill>(`/billing/${billId}/split?guests=${guests}`)).data

export const markBillPaid = async (billId: number): Promise<Bill> =>
  (await apiClient.put<Bill>(`/billing/${billId}/pay`)).data
