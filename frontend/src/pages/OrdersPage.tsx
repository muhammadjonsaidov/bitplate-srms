import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { fetchMenu } from '../api/menu'
import { createOrder, addItemToOrder, submitOrder } from '../api/orders'
import { MenuItem, Table } from '../types'
import toast from 'react-hot-toast'
import { Search, Plus, Send, ChevronRight, AlertTriangle, X } from 'lucide-react'

export default function OrdersPage() {
  const qc = useQueryClient()
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables })
  const { data: menu = [] } = useQuery({ queryKey: ['menu'], queryFn: fetchMenu })

  const occupiedTables = (tables as Table[]).filter(t => t.status === 'OCCUPIED')
  const filteredMenu = (menu as MenuItem[]).filter(m =>
    m.available && m.name.toLowerCase().includes(search.toLowerCase())
  )

  const startOrder = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => { setCurrentOrderId(order.id); toast.success(`Order #${order.id} opened`) },
    onError: () => toast.error('Failed to create order'),
  })

  const addItem = useMutation({
    mutationFn: ({ orderId, menuItemId }: { orderId: number; menuItemId: number }) =>
      addItemToOrder(orderId, { menuItemId, quantity: 1 }),
    onSuccess: () => toast.success('Item added'),
    onError: () => toast.error('Failed to add item'),
  })

  const submit = useMutation({
    mutationFn: submitOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      setCurrentOrderId(null); setSelectedTableId(null)
      toast.success('Order sent to kitchen!')
    },
    onError: () => toast.error('Failed to submit order'),
  })

  const handleCancel = () => {
    setCurrentOrderId(null)
    setSelectedTableId(null)
    setSearch('')
  }

  const categoryMap = filteredMenu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.dtype ?? 'Other'
    ;(acc[cat] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Order</h1>
        <p className="text-sm text-slate-500 mt-1">Select a table and add items from the menu</p>
      </div>

      {!currentOrderId ? (
        <div className="card p-6 max-w-md">
          <h2 className="font-semibold text-slate-900 mb-4">Select table</h2>
          {occupiedTables.length === 0 ? (
            <p className="text-sm text-slate-500 mb-4">No occupied tables. Seat a customer first.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {occupiedTables.map((t: Table) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                    selectedTableId === t.id
                      ? 'border-biteplate-500 bg-biteplate-50 text-biteplate-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="font-medium">Table {t.tableNumber}</span>
                  <span className="text-xs text-slate-500">Capacity {t.capacity}</span>
                </button>
              ))}
            </div>
          )}
          <button
            disabled={!selectedTableId}
            onClick={() => startOrder.mutate({ tableId: selectedTableId! })}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Open order <ChevronRight size={15} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Menu */}
          <div className="lg:col-span-3 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Menu</h2>
              <span className="text-xs text-slate-500">Order #{currentOrderId}</span>
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

            <div className="space-y-5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
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
                          onClick={() => addItem.mutate({ orderId: currentOrderId, menuItemId: item.id })}
                          disabled={addItem.isPending}
                          className="ml-3 flex items-center gap-1 text-xs bg-biteplate-600 hover:bg-biteplate-700 text-white px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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

          {/* Actions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-2">Send to kitchen</h2>
              <p className="text-sm text-slate-500 mb-5">
                Confirm all items are added, then submit the order to the kitchen queue.
              </p>
              <button
                onClick={() => submit.mutate(currentOrderId)}
                disabled={submit.isPending}
                className="btn-success w-full flex items-center justify-center gap-2"
              >
                <Send size={15} />
                Submit order
              </button>
            </div>
            <button
              onClick={handleCancel}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              <X size={14} />
              Cancel order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
