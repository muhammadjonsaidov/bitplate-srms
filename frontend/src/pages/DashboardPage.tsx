import { useQuery } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { fetchKitchenQueue } from '../api/kitchen'
import { Table, Order } from '../types'
import {
  LayoutGrid,
  Users,
  Receipt,
  CalendarClock,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
  ChefHat,
  UtensilsCrossed,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
    refetchInterval: 30_000,
  })
  const { data: activeOrders = [] } = useQuery({
    queryKey: ['kitchen-queue'],
    queryFn: fetchKitchenQueue,
    refetchInterval: 15_000,
  })

  const t = tables as Table[]
  const o = activeOrders as Order[]

  const tableCounts = {
    free:     t.filter((x) => x.status === 'FREE').length,
    occupied: t.filter((x) => x.status === 'OCCUPIED').length,
    awaiting: t.filter((x) => x.status === 'AWAITING_BILL').length,
    reserved: t.filter((x) => x.status === 'RESERVED').length,
  }

  const orderCounts = {
    pending:   o.filter((x) => x.status === 'PENDING').length,
    preparing: o.filter((x) => x.status === 'PREPARING').length,
    ready:     o.filter((x) => x.status === 'READY').length,
  }

  const occupancyPct = t.length
    ? Math.round(((tableCounts.occupied + tableCounts.awaiting) / t.length) * 100)
    : 0

  const totalCovers = o.reduce((sum, order) => sum + (order.table?.capacity ?? 0), 0)

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Live restaurant overview &middot; auto-refreshes</p>
      </div>

      {/* Floor status */}
      <section className="mb-8">
        <div className="section-label">Floor status</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Available',     count: tableCounts.free,     icon: LayoutGrid,   bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', color: 'text-emerald-700' },
            { label: 'Occupied',      count: tableCounts.occupied, icon: Users,         bg: 'bg-orange-50',  iconBg: 'bg-orange-100',  color: 'text-orange-700' },
            { label: 'Awaiting bill', count: tableCounts.awaiting, icon: Receipt,       bg: 'bg-amber-50',   iconBg: 'bg-amber-100',   color: 'text-amber-700' },
            { label: 'Reserved',      count: tableCounts.reserved, icon: CalendarClock, bg: 'bg-blue-50',    iconBg: 'bg-blue-100',    color: 'text-blue-700' },
          ].map(({ label, count, icon: Icon, bg, iconBg, color }) => (
            <div key={label} className={`stat-card ${bg} border-0`}>
              <div className={`stat-icon ${iconBg}`}>
                <Icon size={18} className={color} strokeWidth={1.8} />
              </div>
              <div>
                <div className={`stat-value ${color}`}>{count}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kitchen queue */}
      <section className="mb-8">
        <div className="section-label">Kitchen queue</div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending',   count: orderCounts.pending,   icon: Clock,        bg: 'bg-amber-50',   iconBg: 'bg-amber-100',   color: 'text-amber-700' },
            { label: 'Preparing', count: orderCounts.preparing, icon: Flame,        bg: 'bg-blue-50',    iconBg: 'bg-blue-100',    color: 'text-blue-700' },
            { label: 'Ready',     count: orderCounts.ready,     icon: CheckCircle2, bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', color: 'text-emerald-700' },
          ].map(({ label, count, icon: Icon, bg, iconBg, color }) => (
            <div key={label} className={`stat-card ${bg} border-0`}>
              <div className={`stat-icon ${iconBg}`}>
                <Icon size={18} className={color} strokeWidth={1.8} />
              </div>
              <div>
                <div className={`stat-value ${color}`}>{count}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary metrics */}
      <section>
        <div className="section-label">Summary</div>
        <div className="card p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-surface-100">
            {[
              { label: 'Occupancy',     value: `${occupancyPct}%`, icon: TrendingUp,       color: 'text-brand-600' },
              { label: 'Total tables',   value: t.length,           icon: LayoutGrid,       color: 'text-surface-700' },
              { label: 'Active orders',  value: o.length,           icon: ChefHat,          color: 'text-surface-700' },
              { label: 'Ready to serve', value: orderCounts.ready,  icon: UtensilsCrossed,  color: 'text-emerald-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5">
                <Icon size={20} className={`${color} flex-shrink-0`} strokeWidth={1.8} />
                <div>
                  <p className="text-xs text-surface-500">{label}</p>
                  <p className={`text-xl font-bold ${color} tabular-nums`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
