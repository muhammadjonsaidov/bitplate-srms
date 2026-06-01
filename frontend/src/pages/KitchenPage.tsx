import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchKitchenQueue,
  prepareOrder,
  markOrderReady,
  cancelOrder,
  markServed,
  undoLastAction,
} from '../api/kitchen'
import { Order } from '../types'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Clock, Flame, CheckCircle2, Undo2, AlertTriangle, X, Truck } from 'lucide-react'
import clsx from 'clsx'

const columns = [
  {
    status: 'PENDING',
    label: 'Pending',
    icon: Clock,
    header: 'kitchen-col-pending',
    border: 'border-l-amber-400',
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    icon: Flame,
    header: 'kitchen-col-preparing',
    border: 'border-l-blue-400',
  },
  {
    status: 'READY',
    label: 'Ready to serve',
    icon: CheckCircle2,
    header: 'kitchen-col-ready',
    border: 'border-l-emerald-400',
  },
] as const

export default function KitchenPage() {
  const qc = useQueryClient()
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['kitchen-queue'],
    queryFn: fetchKitchenQueue,
    refetchInterval: 10_000,
  })

  const inv = () => qc.invalidateQueries({ queryKey: ['kitchen-queue'] })

  const prepare = useMutation({ mutationFn: prepareOrder,   onSuccess: inv, onError: () => toast.error('Failed') })
  const ready   = useMutation({ mutationFn: markOrderReady, onSuccess: inv, onError: () => toast.error('Failed') })
  const cancel  = useMutation({ mutationFn: cancelOrder,    onSuccess: inv, onError: () => toast.error('Failed') })
  const served  = useMutation({ mutationFn: markServed,     onSuccess: inv, onError: () => toast.error('Failed') })
  const undo    = useMutation({
    mutationFn: undoLastAction,
    onSuccess: (d) => { inv(); toast.success(d.message) },
    onError: () => toast.error('Nothing to undo'),
  })

  const o = orders as Order[]

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-surface-400 text-sm">Loading kitchen…</div>
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Kitchen Display</h1>
          <p className="page-subtitle">
            {o.length} active order{o.length !== 1 ? 's' : ''} &middot; refreshes every 10s
          </p>
        </div>
        <button onClick={() => undo.mutate()} disabled={undo.isPending} className="btn-secondary">
          <Undo2 size={14} />
          Undo last action
        </button>
      </div>

      {o.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-surface-700">All caught up</p>
          <p className="text-xs mt-1">No active orders in the queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {columns.map(({ status, label, icon: Icon, header, border }) => {
            const colOrders = o.filter((order) => order.status === status)
            return (
              <div key={status} className="flex flex-col gap-3">
                {/* Column header */}
                <div className={clsx('flex items-center justify-between px-4 py-2.5 rounded-xl', header)}>
                  <div className="flex items-center gap-2 font-bold text-[13px]">
                    <Icon size={15} strokeWidth={2} />
                    {label}
                  </div>
                  <span className="text-xs font-bold opacity-70">{colOrders.length}</span>
                </div>

                {/* Cards */}
                {colOrders.length === 0 && (
                  <div className="text-center text-surface-400 text-xs py-10 border border-dashed border-surface-200 rounded-2xl">
                    No {label.toLowerCase()} orders
                  </div>
                )}

                {colOrders.map((order) => (
                  <div
                    key={order.id}
                    className={clsx('card border-l-[3px] p-4 flex flex-col gap-3', border)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-surface-900 text-sm">Order #{order.id}</div>
                        <div className="text-xs text-surface-500 mt-0.5">
                          Table {order.table.tableNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-surface-400">
                        <Clock size={11} />
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Items */}
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-xs text-surface-700">
                          <span className="font-bold text-surface-900 tabular-nums">
                            {item.quantity}&times;
                          </span>
                          <span className="truncate">{item.menuItem.name}</span>
                          {item.allergenFlagged && (
                            <AlertTriangle size={11} className="text-orange-500 flex-shrink-0" />
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => prepare.mutate(order.id)}
                          disabled={prepare.isPending}
                          className="flex-1 btn-primary btn-sm"
                        >
                          <Flame size={12} />
                          Start preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => ready.mutate(order.id)}
                          disabled={ready.isPending}
                          className="flex-1 btn-success btn-sm"
                        >
                          <CheckCircle2 size={12} />
                          Mark ready
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={() => served.mutate(order.id)}
                          disabled={served.isPending}
                          className="flex-1 btn-primary btn-sm"
                        >
                          <Truck size={12} />
                          Mark served
                        </button>
                      )}
                      {order.status !== 'READY' && (
                        <button
                          onClick={() => cancel.mutate(order.id)}
                          disabled={cancel.isPending}
                          className="btn-danger btn-sm"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
