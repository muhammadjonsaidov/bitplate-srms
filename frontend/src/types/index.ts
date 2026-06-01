export type StaffRole = 'MANAGER' | 'HEAD_CHEF' | 'WAITER' | 'CASHIER'
export type TableStatus = 'FREE' | 'RESERVED' | 'OCCUPIED' | 'AWAITING_BILL' | 'CLEARED'
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ARRIVED' | 'EXPIRED'

export interface Staff {
  id: number; name: string; username: string; role: StaffRole; active: boolean
}
export interface Table {
  id: number; tableNumber: number; capacity: number; status: TableStatus
}
export interface MenuItem {
  id: number; dtype: string; name: string; description: string
  price: number; available: boolean; allergens: string | null
}
export interface OrderItem {
  id: number; menuItem: MenuItem; quantity: number
  unitPrice: number; customisations: string | null; allergenFlagged: boolean
}
export interface Order {
  id: number; table: Table; staff: Staff; status: OrderStatus
  notes: string | null; items: OrderItem[]; createdAt: string
}
export interface BillLineItem { id: number; description: string; amount: number }
export interface Bill {
  id: number; order: Order; subtotal: number; tax: number; tip: number
  total: number; pricingStrategy: string; splitCount: number; paid: boolean
  lineItems: BillLineItem[]
}
export interface Reservation {
  id: number
  table: Table
  customerName: string
  customerPhone: string | null
  partySize: number
  scheduledAt: string
  status: ReservationStatus
  createdAt: string
}
export interface AuthResponse { accessToken: string; staff: Staff }
