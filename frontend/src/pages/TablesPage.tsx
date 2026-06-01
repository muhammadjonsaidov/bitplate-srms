import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, seatCustomer, reserveTable, requestBill, clearTable } from '../api/tables'
import { Table, TableStatus, TABLE_STATUS_CONFIG } from '../types'
import toast from 'react-hot-toast'
import { Users, Armchair, CalendarClock, Receipt, Trash2 } from 'lucide-react'
import clsx from 'clsx'

export default function TablesPage() {
  const qc = useQueryClient()
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
    refetchInterval: 15_000,
  })

  const inv = () => qc.invalidateQueries({ queryKey: ['tables'] })

  const seat    = useMutation({ mutationFn: seatCustomer, onSuccess: () => { inv(); toast.success('Customer seated') }, onError: () => toast.error('Cannot seat at this table') })
  const reserve = useMutation({ mutationFn: reserveTable, onSuccess: () => { inv(); toast.success('Table reserved') }, onError: () => toast.error('Cannot reserve this table') })
  const reqBill = useMutation({ mutationFn: requestBill,  onSuccess: () => { inv(); toast.success('Bill requested') }, onError: () => toast.error('Cannot request bill') })
  const clear   = useMutation({ mutationFn: clearTable,   onSuccess: () => { inv(); toast.success('Table cleared') },  onError: () => toast.error('Cannot clear table') })

  const t = tables as Table[]
  const counts = {
    total:    t.length,
    free:     t.filter((x) => x.status === 'FREE').length,
    occupied: t.filter((x) => x.status === 'OCCUPIED').length,
    reserved: t.filter((x) => x.status === 'RESERVED').length,
    awaiting: t.filter((x) => x.status === 'AWAITING_BILL').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-surface-400 text-sm">
        Loading tables…
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Floor Plan</h1>
          <p className="page-subtitle">
            {counts.total} tables &middot; {counts.free} available &middot; {counts.occupied} occupied
          </p>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(TABLE_STATUS_CONFIG).map(([status, cfg]) => (
            <span key={status} className="flex items-center gap-1.5 text-xs text-surface-500">
              <span className={clsx('dot', cfg.dot)} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {t.map((table) => {
          const cfg = TABLE_STATUS_CONFIG[table.status]
          return (
            <div
              key={table.id}
              className={clsx(
                'card border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-card-hover',
                cfg.card
              )}
            >
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-surface-900 tracking-tight">
                    T{table.tableNumber}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
                    <Users size={11} strokeWidth={2} />
                    {table.capacity} seats
                  </div>
                </div>
                <span className={clsx('badge', cfg.badge)}>
                  <span className={clsx('dot', cfg.dot)} />
                  {cfg.label}
                </span>
              </div>

              {/* Actions based on state */}
              <div className="flex flex-col gap-1.5 mt-auto">
                {table.status === 'FREE' && (
                  <>
                    <button
                      onClick={() => seat.mutate(table.id)}
                      disabled={seat.isPending}
                      className="btn-primary btn-sm w-full"
                    >
                      <Armchair size={13} />
                      Seat guest
                    </button>
                    <button
                      onClick={() => reserve.mutate(table.id)}
                      disabled={reserve.isPending}
                      className="btn-secondary btn-sm w-full"
                    >
                      <CalendarClock size={13} />
                      Reserve
                    </button>
                  </>
                )}
                {table.status === 'OCCUPIED' && (
                  <button
                    onClick={() => reqBill.mutate(table.id)}
                    disabled={reqBill.isPending}
                    className="btn-secondary btn-sm w-full"
                  >
                    <Receipt size={13} />
                    Request bill
                  </button>
                )}
                {(table.status === 'AWAITING_BILL' || table.status === 'CLEARED') && (
                  <button
                    onClick={() => clear.mutate(table.id)}
                    disabled={clear.isPending}
                    className="btn-secondary btn-sm w-full"
                  >
                    <Trash2 size={13} />
                    Clear table
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
