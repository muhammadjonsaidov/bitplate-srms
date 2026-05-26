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
} from 'lucide-react'

export default function DashboardPage() {
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'], queryFn: fetchTables, refetchInterval: 30_000,
  })
  const { data: activeOrders = [] } = useQuery({
    queryKey: ['kitchen-queue'], queryFn: fetchKitchenQueue, refetchInterval: 15_000,
  })

  const t = tables as Table[]
  const o = activeOrders as Order[]

  const tableCounts = {
    free:     t.filter(x => x.status === 'FREE').length,
    occupied: t.filter(x => x.status === 'OCCUPIED').length,
    awaiting: t.filter(x => x.status === 'AWAITING_BILL').length,
    reserved: t.filter(x => x.status === 'RESERVED').length,
  }

  const orderCounts = {
    pending:   o.filter(x => x.status === 'PENDING').length,
    preparing: o.filter(x => x.status === 'PREPARING').length,
    ready:     o.filter(x => x.status === 'READY').length,
  }

  const occupancyPct = t.length
    ? Math.round(((tableCounts.occupied + tableCounts.awaiting) / t.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Live restaurant status — refreshes automatically</p>
      </div>

      {/* Table status */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Floor status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Available',     count: tableCounts.free,     icon: LayoutGrid,   bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
            { label: 'Occupied',      count: tableCounts.occupied, icon: Users,        bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  iconBg: 'bg-orange-100' },
            { label: 'Awaiting Bill', count: tableCounts.awaiting, icon: Receipt,      bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   iconBg: 'bg-amber-100' },
            { label: 'Reserved',      count: tableCounts.reserved, icon: CalendarClock, bg: 'bg-blue-50',   border: 'border-blue-200',    text: 'text-blue-700',    iconBg: 'bg-blue-100' },
          ].map(({ label, count, icon: Icon, bg, border, text, iconBg }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-5 flex items-start gap-4`}>
              <div className={`${iconBg} p-2 rounded-lg`}>
                <Icon size={18} className={text} />
              </div>
              <div>
                <div className={`text-3xl font-bold ${text}`}>{count}</div>
                <div className={`text-xs font-medium ${text} mt-0.5 opacity-80`}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kitchen queue */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Kitchen queue</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending',   count: orderCounts.pending,   icon: Clock,         bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   iconBg: 'bg-amber-100' },
            { label: 'Preparing', count: orderCounts.preparing, icon: Flame,         bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    iconBg: 'bg-blue-100' },
            { label: 'Ready',     count: orderCounts.ready,     icon: CheckCircle2,  bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
          ].map(({ label, count, icon: Icon, bg, border, text, iconBg }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-5 flex items-start gap-4`}>
              <div className={`${iconBg} p-2 rounded-lg`}>
                <Icon size={18} className={text} />
              </div>
              <div>
                <div className={`text-3xl font-bold ${text}`}>{count}</div>
                <div className={`text-xs font-medium ${text} mt-0.5 opacity-80`}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Summary</h2>
        <div className="card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: 'Occupancy rate',  value: `${occupancyPct}%`, icon: TrendingUp,   color: 'text-biteplate-600' },
              { label: 'Total tables',    value: t.length,            icon: LayoutGrid,   color: 'text-slate-700' },
              { label: 'Active orders',   value: o.length,            icon: Flame,        color: 'text-slate-700' },
              { label: 'Ready to serve',  value: orderCounts.ready,   icon: CheckCircle2, color: 'text-emerald-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="px-6 first:pl-0 last:pr-0 flex items-center gap-3">
                <Icon size={20} className={`${color} flex-shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
