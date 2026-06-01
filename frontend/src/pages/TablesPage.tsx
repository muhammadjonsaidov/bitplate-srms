import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, seatCustomer, reserveTable, requestBill, clearTable } from '../api/tables'
import { Table, TableStatus } from '../types'
import toast from 'react-hot-toast'
import { Users, CircleDot } from 'lucide-react'
import clsx from 'clsx'

const statusConfig: Record<TableStatus, { label: string; badge: string; card: string }> = {
  FREE:          { label: 'Available',     badge: 'bg-emerald-100 text-emerald-700', card: 'border-emerald-200 bg-white' },
  RESERVED:      { label: 'Reserved',      badge: 'bg-blue-100 text-blue-700',       card: 'border-blue-200 bg-blue-50' },
  OCCUPIED:      { label: 'Occupied',      badge: 'bg-orange-100 text-orange-700',   card: 'border-orange-200 bg-orange-50' },
  AWAITING_BILL: { label: 'Awaiting Bill', badge: 'bg-amber-100 text-amber-700',     card: 'border-amber-200 bg-amber-50' },
  CLEARED:       { label: 'Cleared',       badge: 'bg-slate-100 text-slate-600',     card: 'border-slate-200 bg-white' },
}

const statusDot: Record<TableStatus, string> = {
  FREE:          'bg-emerald-500',
  RESERVED:      'bg-blue-500',
  OCCUPIED:      'bg-orange-500',
  AWAITING_BILL: 'bg-amber-500',
  CLEARED:       'bg-slate-400',
}

export default function TablesPage() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['tables'] })

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'], queryFn: fetchTables, refetchInterval: 15_000,
  })

  const seat    = useMutation({ mutationFn: seatCustomer,  onSuccess: () => { inv(); toast.success('Customer seated') },      onError: (e: any) => toast.error(e.response?.data?.message ?? 'Cannot seat customer') })
  const reserve = useMutation({ mutationFn: reserveTable,  onSuccess: () => { inv(); toast.success('Table reserved') },        onError: (e: any) => toast.error(e.response?.data?.message ?? 'Cannot reserve table') })
  const reqBill = useMutation({ mutationFn: requestBill,   onSuccess: () => { inv(); toast.success('Bill requested') },        onError: (e: any) => toast.error(e.response?.data?.message ?? 'Cannot request bill') })
  const clear   = useMutation({ mutationFn: clearTable,    onSuccess: () => { inv(); toast.success('Table cleared') },         onError: (e: any) => toast.error(e.response?.data?.message ?? 'Cannot clear table') })

  const t = tables as Table[]
  const counts = {
    free:     t.filter(x => x.status === 'FREE').length,
    occupied: t.filter(x => x.status === 'OCCUPIED').length,
    awaiting: t.filter(x => x.status === 'AWAITING_BILL').length,
    reserved: t.filter(x => x.status === 'RESERVED').length,
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading tables…</div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tables</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t.length} tables · {counts.free} available · {counts.occupied} occupied · {counts.reserved} reserved
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-4 text-xs text-slate-500">
          {Object.entries(statusConfig).map(([status, cfg]) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', statusDot[status as TableStatus])} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {t.map(table => {
          const cfg = statusConfig[table.status]
          const busy = seat.isPending || reserve.isPending || reqBill.isPending || clear.isPending
          return (
            <div
              key={table.id}
              className={clsx('border rounded-xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-md', cfg.card)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900">T{table.tableNumber}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Users size={11} />
                    {table.capacity}
                  </div>
                </div>
                <span className={clsx('badge', cfg.badge)}>
                  <CircleDot size={8} className="mr-1" />
                  {cfg.label}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {table.status === 'FREE' && (
                  <>
                    <button
                      onClick={() => seat.mutate(table.id)}
                      disabled={busy}
                      className="w-full text-xs btn-primary py-1.5"
                    >
                      Seat Guest
                    </button>
                    <button
                      onClick={() => reserve.mutate(table.id)}
                      disabled={busy}
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-lg transition-colors disabled:opacity-40"
                    >
                      Reserve
                    </button>
                  </>
                )}
                {table.status === 'OCCUPIED' && (
                  <button
                    onClick={() => reqBill.mutate(table.id)}
                    disabled={busy}
                    className="w-full text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    Request Bill
                  </button>
                )}
                {(table.status === 'AWAITING_BILL' || table.status === 'CLEARED') && (
                  <button
                    onClick={() => clear.mutate(table.id)}
                    disabled={busy}
                    className="w-full text-xs btn-secondary py-1.5"
                  >
                    Clear Table
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
