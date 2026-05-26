import { useQuery } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { fetchKitchenQueue } from '../api/kitchen'
import { Table, Order } from '../types'

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Live restaurant status</p>
      </div>

      {/* Table status */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tables</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Free',          count: tableCounts.free,     bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
            { label: 'Occupied',      count: tableCounts.occupied, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
            { label: 'Awaiting Bill', count: tableCounts.awaiting, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
            { label: 'Reserved',      count: tableCounts.reserved, bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
          ].map(({ label, count, bg, border, text }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-5`}>
              <div className={`text-3xl font-bold ${text}`}>{count}</div>
              <div className={`text-sm ${text} mt-1`}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Kitchen status */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Kitchen</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending',   count: orderCounts.pending,   bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
            { label: 'Preparing', count: orderCounts.preparing, bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
            { label: 'Ready',     count: orderCounts.ready,     bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
          ].map(({ label, count, bg, border, text }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-5`}>
              <div className={`text-3xl font-bold ${text}`}>{count}</div>
              <div className={`text-sm ${text} mt-1`}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Occupancy rate</p>
          <p className="text-2xl font-bold text-gray-800">{occupancyPct}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total tables</p>
          <p className="text-2xl font-bold text-gray-800">{t.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Active orders</p>
          <p className="text-2xl font-bold text-gray-800">{o.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ready to serve</p>
          <p className="text-2xl font-bold text-green-600">{orderCounts.ready}</p>
        </div>
      </div>
    </div>
  )
}
