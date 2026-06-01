import { api } from './client'
import { Bill, PricingStrategy } from '../types'

export const generateBill = async (orderId: number, strategy: PricingStrategy = 'STANDARD'): Promise<Bill> =>
  (await api.post<Bill>(`/billing/generate/${orderId}?strategy=${strategy}`)).data

export const applyTip = async (billId: number, tip: number): Promise<Bill> =>
  (await api.put<Bill>(`/billing/${billId}/tip?tip=${tip}`)).data

export const splitBill = async (billId: number, guests: number): Promise<Bill> =>
  (await api.put<Bill>(`/billing/${billId}/split?guests=${guests}`)).data

export const markBillPaid = async (billId: number): Promise<Bill> =>
  (await api.put<Bill>(`/billing/${billId}/pay`)).data

export const getBillForOrder = async (orderId: number): Promise<Bill> =>
  (await api.get<Bill>(`/billing/order/${orderId}`)).data
