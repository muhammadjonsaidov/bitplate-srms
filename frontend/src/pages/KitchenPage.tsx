import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchKitchenQueue, prepareOrder, markOrderReady, cancelOrder, undoLastAction } from '../api/kitchen'
import { Order } from '../types'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Clock, Flame, CheckCircle2, Undo2, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

const columns: { status: string; label: string; icon: typeof Clock; headerClass: string }[] = [
  { status: 'PENDING',   label: 'Pending',   icon: Clock,         headerClass: 'border-amber-400 text-amber-700 bg-amber-50' },
  { status: 'PREPARING', label: 'Preparing', icon: Flame,         headerClass: 'border-blue-400 text-blue-700 bg-blue-50' },
  { status: 'READY',     label: 'Ready',     icon: CheckCircle2,  headerClass: 'border-emerald-400 text-emerald-700 bg-emerald-50' },
]

const cardConfig: Record<string, { border: string; dot: string }> = {
  PENDING:   { border: 'border-amber-200',   dot: 'bg-amber-400' },
  PREPARING: { border: 'border-blue-200',    dot: 'bg-blue-500' },
  READY:     { border: 'border-emerald-200', dot: 'bg-emerald-500' },
}

export default function KitchenPage() {
  const qc = useQueryClient()
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['kitchen-queue'], queryFn: fetchKitchenQueue, refetchInterval: 10_000,
  })
  const inv = () => qc.invalidateQueries({ queryKey: ['kitchen-queue'] })

  const prepare = useMutation({ mutationFn: prepareOrder,     onSuccess: inv, onError: () => toast.error('Failed to update order') })
  const ready   = useMutation({ mutationFn: markOrderReady,   onSuccess: inv, onError: () => toast.error('Failed to update order') })
  const cancel  = useMutation({ mutationFn: cancelOrder,      onSuccess: inv, onError: () => toast.error('Failed to cancel order') })
  const undo    = useMutation({
    mutationFn: undoLastAction,
    onSuccess: (d) => { inv(); toast.success(d.message) },
    onError: () => toast.error('Nothing to undo'),
  })

  const o = orders as Order[]

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading kitchen queue…</div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kitchen Display</h1>
          <p className="text-sm text-slate-500 mt-1">{o.length} active order{o.length !== 1 ? 's' : ''} · refreshes every 10s</p>
        </div>
        <button
          onClick={() => undo.mutate()}
          disabled={undo.isPending}
          className="flex items-center gap-2 btn-secondary text-sm"
        >
          <Undo2 size={14} />
          Undo last action
        </button>
      </div>

      {o.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <CheckCircle2 size={40} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium">All caught up</p>
          <p className="text-xs mt-1">No active orders in the queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {columns.map(({ status, label, icon: Icon, headerClass }) => {
            const colOrders = o.filter(order => order.status === status)
            return (
              <div key={status} className="flex flex-col gap-3">
                {/* Column header */}
                <div className={clsx('flex items-center justify-between px-4 py-2.5 rounded-lg border-l-4', headerClass)}>
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Icon size={15} />
                    {label}
                  </div>
                  <span className="text-xs font-bold">{colOrders.length}</span>
                </div>

                {/* Order cards */}
                {colOrders.length === 0 && (
                  <div className="text-center text-slate-400 text-xs py-8 border border-dashed border-slate-200 rounded-xl">
                    No {label.toLowerCase()} orders
                  </div>
                )}
                {colOrders.map(order => {
                  const cfg = cardConfig[order.status] ?? { border: 'border-slate-200', dot: 'bg-slate-400' }
                  return (
                    <div key={order.id} className={clsx('card border-l-4 p-4 flex flex-col gap-3', cfg.border)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Order #{order.id}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Table {order.table.tableNumber}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={11} />
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      <ul className="space-y-1">
                        {order.items.map(item => (
                          <li key={item.id} className="flex items-center gap-2 text-xs text-slate-700">
                            <span className="font-medium text-slate-900 tabular-nums">{item.quantity}×</span>
                            {item.menuItem.name}
                            {item.allergenFlagged && (
                              <AlertTriangle size={11} className="text-orange-500 flex-shrink-0" />
                            )}
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-2 pt-1">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => prepare.mutate(order.id)}
                            disabled={prepare.isPending}
                            className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors font-medium"
                          >
                            Start preparing
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => ready.mutate(order.id)}
                            disabled={ready.isPending}
                            className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg transition-colors font-medium"
                          >
                            Mark ready
                          </button>
                        )}
                        {order.status !== 'READY' && (
                          <button
                            onClick={() => cancel.mutate(order.id)}
                            disabled={cancel.isPending}
                            className="flex items-center gap-1 text-xs btn-danger py-1.5 px-3"
                          >
                            <X size={11} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
