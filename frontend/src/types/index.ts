/* ─── Staff & Auth ──────────────────────────────────── */
export type StaffRole = 'MANAGER' | 'HEAD_CHEF' | 'WAITER' | 'CASHIER'

export interface Staff {
  id: number
  name: string
  username: string
  role: StaffRole
  active: boolean
}

export interface AuthResponse {
  accessToken: string
  staff: Staff
}

/* ─── Tables ────────────────────────────────────────── */
export type TableStatus = 'FREE' | 'RESERVED' | 'OCCUPIED' | 'AWAITING_BILL' | 'CLEARED'

export interface Table {
  id: number
  tableNumber: number
  capacity: number
  status: TableStatus
}

/* ─── Menu ──────────────────────────────────────────── */
export interface MenuItem {
  id: number
  dtype: string | null
  category: string
  name: string
  description: string
  price: number
  available: boolean
  allergens: string | null
}

export interface CreateMenuItemRequest {
  category: string
  name: string
  description: string
  price: number
}

/* ─── Orders ────────────────────────────────────────── */
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'

export interface OrderItem {
  id: number
  menuItem: MenuItem
  quantity: number
  unitPrice: number
  customisations: string | null
  allergenFlagged: boolean
}

export interface Order {
  id: number
  table: Table
  staff: Staff
  status: OrderStatus
  notes: string | null
  items: OrderItem[]
  createdAt: string
}

/* ─── Billing ───────────────────────────────────────── */
export interface BillLineItem {
  id: number
  description: string
  amount: number
}

export interface Bill {
  id: number
  order: Order
  subtotal: number
  tax: number
  tip: number
  total: number
  pricingStrategy: string
  splitCount: number
  paid: boolean
  lineItems: BillLineItem[]
}

/* ─── Reservations ──────────────────────────────────── */
export type ReservationStatus = 'CONFIRMED' | 'ARRIVED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED'

export interface Reservation {
  id: number
  table: Table
  customerName: string
  customerPhone: string | null
  partySize: number
  reservationTime: string
  status: ReservationStatus
  createdAt: string
}

export interface CreateReservationRequest {
  tableId: number
  customerName: string
  customerPhone?: string
  partySize: number
  scheduledAt: string
}

/* ─── Pricing strategies ────────────────────────────── */
export type PricingStrategy = 'STANDARD' | 'HAPPY_HOUR' | 'LOYALTY_CARD'

export const PRICING_STRATEGIES: { value: PricingStrategy; label: string; description: string }[] = [
  { value: 'STANDARD',     label: 'Standard',    description: 'Regular pricing' },
  { value: 'HAPPY_HOUR',   label: 'Happy Hour',  description: '20% off all items' },
  { value: 'LOYALTY_CARD', label: 'Loyalty Card', description: '10% off + free drink' },
]

/* ─── Status config maps ────────────────────────────── */
export const TABLE_STATUS_CONFIG: Record<TableStatus, {
  label: string; badge: string; card: string; dot: string
}> = {
  FREE:          { label: 'Available',     badge: 'badge-green',  card: 'status-card-free',     dot: 'dot-green'  },
  RESERVED:      { label: 'Reserved',      badge: 'badge-blue',   card: 'status-card-reserved', dot: 'dot-blue'   },
  OCCUPIED:      { label: 'Occupied',      badge: 'badge-orange', card: 'status-card-occupied', dot: 'dot-orange' },
  AWAITING_BILL: { label: 'Awaiting Bill', badge: 'badge-amber',  card: 'status-card-awaiting', dot: 'dot-amber'  },
  CLEARED:       { label: 'Cleared',       badge: 'badge-gray',   card: 'status-card-cleared',  dot: 'dot-gray'   },
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string; badge: string; dot: string
}> = {
  PENDING:   { label: 'Pending',   badge: 'badge-amber',  dot: 'dot-amber'  },
  PREPARING: { label: 'Preparing', badge: 'badge-blue',   dot: 'dot-blue'   },
  READY:     { label: 'Ready',     badge: 'badge-green',  dot: 'dot-green'  },
  SERVED:    { label: 'Served',    badge: 'badge-gray',   dot: 'dot-gray'   },
  CANCELLED: { label: 'Cancelled', badge: 'badge-red',    dot: 'dot-red'    },
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  MANAGER:   'Manager',
  HEAD_CHEF: 'Head Chef',
  WAITER:    'Waiter',
  CASHIER:   'Cashier',
}
