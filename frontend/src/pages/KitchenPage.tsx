import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchKitchenQueue, prepareOrder, markOrderReady, cancelOrder, undoLastAction } from '../api/kitchen'
import { Order } from '../types'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  PENDING:   'bg-yellow-50 border-yellow-300',
  PREPARING: 'bg-blue-50 border-blue-300',
  READY:     'bg-green-50 border-green-300',
}

export default function KitchenPage() {
  const qc = useQueryClient()
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['kitchen-queue'], queryFn: fetchKitchenQueue, refetchInterval: 10_000,
  })
  const inv = () => qc.invalidateQueries({ queryKey: ['kitchen-queue'] })
  const prepare = useMutation({ mutationFn: prepareOrder, onSuccess: inv, onError: () => toast.error('Error') })
  const ready   = useMutation({ mutationFn: markOrderReady, onSuccess: inv, onError: () => toast.error('Error') })
  const cancel  = useMutation({ mutationFn: cancelOrder, onSuccess: inv, onError: () => toast.error('Error') })
  const undo    = useMutation({
    mutationFn: undoLastAction,
    onSuccess: (d) => { inv(); toast.success(d.message) },
    onError: () => toast.error('Nothing to undo'),
  })

  if (isLoading) return <div className="p-8 text-gray-500">Loading kitchen queue…</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kitchen Queue</h2>
        <button onClick={() => undo.mutate()}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">
          ↩ Undo Last Action
        </button>
      </div>
      {orders.length === 0
        ? <div className="text-gray-400 text-center py-16">No active orders in queue</div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(orders as Order[]).map(order => (
              <div key={order.id} className={`border-2 rounded-xl p-4 ${statusColors[order.status] ?? 'bg-gray-50'}`}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold">Order #{order.id}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border">{order.status}</span>
                </div>
                <div className="text-sm mb-1">Table {order.table.tableNumber}</div>
                <div className="text-xs text-gray-500 mb-3">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </div>
                <ul className="text-xs space-y-1 mb-3">
                  {order.items.map(item => (
                    <li key={item.id}>{item.quantity}× {item.menuItem.name}
                      {item.allergenFlagged && <span className="text-orange-600 ml-1">⚠️</span>}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <button onClick={() => prepare.mutate(order.id)}
                      className="flex-1 text-xs bg-blue-600 text-white py-1 rounded">Prepare</button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button onClick={() => ready.mutate(order.id)}
                      className="flex-1 text-xs bg-green-600 text-white py-1 rounded">Ready ✓</button>
                  )}
                  {order.status !== 'READY' && (
                    <button onClick={() => cancel.mutate(order.id)}
                      className="flex-1 text-xs bg-red-100 text-red-700 py-1 rounded">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
