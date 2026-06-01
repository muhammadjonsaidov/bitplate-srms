import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { fetchMenu } from '../api/menu'
import { createOrder, fetchOrder, addItemToOrder, removeItemFromOrder, submitOrder } from '../api/orders'
import { MenuItem, Order, Table } from '../types'
import toast from 'react-hot-toast'
import { Search, Plus, Send, ChevronRight, AlertTriangle, X, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import Spinner from '../components/ui/Spinner'

export default function OrdersPage() {
  const qc = useQueryClient()
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables })
  const { data: menu = [] } = useQuery({ queryKey: ['menu'], queryFn: fetchMenu })
  const { data: currentOrder, isLoading: orderLoading } = useQuery({
    queryKey: ['order', currentOrderId],
    queryFn: () => fetchOrder(currentOrderId!),
    enabled: !!currentOrderId,
    refetchInterval: false,
  })

  const occupiedTables = (tables as Table[]).filter(t => t.status === 'OCCUPIED')
  const filteredMenu = (menu as MenuItem[]).filter(m =>
    m.available && m.name.toLowerCase().includes(search.toLowerCase())
  )
  const categoryMap = filteredMenu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.dtype ?? 'Other'
    ;(acc[cat] ??= []).push(item)
    return acc
  }, {})

  const invOrder = () => qc.invalidateQueries({ queryKey: ['order', currentOrderId] })

  const startOrder = useMutation({
    mutationFn: createOrder,
    onSuccess: (order: Order) => {
      setCurrentOrderId(order.id)
      qc.setQueryData(['order', order.id], order)
      toast.success(`Order #${order.id} opened`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create order'),
  })

  const addItem = useMutation({
    mutationFn: ({ menuItemId }: { menuItemId: number }) =>
      addItemToOrder(currentOrderId!, { menuItemId, quantity: 1 }),
    onSuccess: (order: Order) => {
      qc.setQueryData(['order', currentOrderId], order)
      toast.success('Item added')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to add item'),
  })

  const removeItem = useMutation({
    mutationFn: (itemId: number) => removeItemFromOrder(currentOrderId!, itemId),
    onSuccess: (order: Order) => {
      qc.setQueryData(['order', currentOrderId], order)
      toast.success('Item removed')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to remove item'),
  })

  const submit = useMutation({
    mutationFn: () => submitOrder(currentOrderId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      invOrder()
      setCurrentOrderId(null)
      setSelectedTableId(null)
      setSearch('')
      toast.success('Order sent to kitchen!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to submit order'),
  })

  const handleCancel = () => {
    setCurrentOrderId(null)
    setSelectedTableId(null)
    setSearch('')
  }

  const order: Order | undefined = currentOrder

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
        <p className="text-sm text-slate-500 mt-1">Select a table and build the order</p>
      </div>

      {!currentOrderId ? (
        <div className="card p-6 max-w-md">
          <h2 className="font-semibold text-slate-900 mb-4">Select occupied table</h2>
          {occupiedTables.length === 0 ? (
            <p className="text-sm text-slate-500 mb-4">No occupied tables. Seat a customer first from the Tables page.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {occupiedTables.map((t: Table) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors',
                    selectedTableId === t.id
                      ? 'border-biteplate-500 bg-biteplate-50 text-biteplate-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  )}
                >
                  <span className="font-medium">Table {t.tableNumber}</span>
                  <span className="text-xs text-slate-500">Capacity {t.capacity}</span>
                </button>
              ))}
            </div>
          )}
          <button
            disabled={!selectedTableId || startOrder.isPending}
            onClick={() => startOrder.mutate({ tableId: selectedTableId! })}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {startOrder.isPending ? <Spinner size={16} /> : <ChevronRight size={15} />}
            Open order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Menu */}
          <div className="lg:col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Menu</h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Order #{currentOrderId}</span>
            </div>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search dishes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-5 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {Object.entries(categoryMap).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{cat}</h3>
                  <div className="space-y-1">
                    {items.map((item: MenuItem) => (
                      <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 group">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">£{item.price.toFixed(2)}</span>
                            {item.allergens && (
                              <span className="flex items-center gap-1 text-xs text-orange-600">
                                <AlertTriangle size={10} />
                                {item.allergens}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => addItem.mutate({ menuItemId: item.id })}
                          disabled={addItem.isPending}
                          className="ml-3 flex items-center gap-1 text-xs bg-biteplate-600 hover:bg-biteplate-700 text-white px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
                        >
                          <Plus size={12} />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredMenu.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No items match your search</p>
              )}
            </div>
          </div>

          {/* Order summary + actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Current items */}
            <div className="card p-5 flex-1">
              <h2 className="font-semibold text-slate-900 mb-3">
                Order summary
                {order && order.items.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">({order.items.length} item{order.items.length !== 1 ? 's' : ''})</span>
                )}
              </h2>
              {orderLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : !order || order.items.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No items added yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 group">
                      <span className="text-xs font-bold text-slate-500 w-5 text-center">{item.quantity}×</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{item.menuItem.name}</div>
                        <div className="text-xs text-slate-400">£{(item.unitPrice * item.quantity).toFixed(2)}</div>
                      </div>
                      {item.allergenFlagged && <AlertTriangle size={12} className="text-orange-500 flex-shrink-0" />}
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        disabled={removeItem.isPending}
                        className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between text-sm font-semibold text-slate-900 px-2">
                    <span>Subtotal</span>
                    <span>£{order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-5">
              <button
                onClick={() => submit.mutate()}
                disabled={submit.isPending || !order || order.items.length === 0}
                className="btn-success w-full flex items-center justify-center gap-2 mb-3"
              >
                {submit.isPending ? <Spinner size={16} /> : <Send size={15} />}
                Submit to kitchen
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <X size={14} />
                Cancel order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
