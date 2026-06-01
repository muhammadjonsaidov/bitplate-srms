import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { fetchMenu } from '../api/menu'
import { createOrder, addItemToOrder, removeItemFromOrder, submitOrder, getOrder } from '../api/orders'
import { MenuItem, Table, Order } from '../types'
import toast from 'react-hot-toast'
import { Search, Plus, Send, ChevronRight, AlertTriangle, X, Minus, ShoppingBag } from 'lucide-react'

export default function OrdersPage() {
  const qc = useQueryClient()
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [customisation, setCustomisation] = useState('')

  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables })
  const { data: menu = [] } = useQuery({ queryKey: ['menu'], queryFn: fetchMenu })

  const occupiedTables = (tables as Table[]).filter((t) => t.status === 'OCCUPIED')
  const filteredMenu = (menu as MenuItem[]).filter(
    (m) => m.available && m.name.toLowerCase().includes(search.toLowerCase())
  )

  const startOrder = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setCurrentOrder(order)
      toast.success(`Order #${order.id} opened`)
    },
    onError: () => toast.error('Failed to create order'),
  })

  const addItem = useMutation({
    mutationFn: ({ orderId, menuItemId, qty }: { orderId: number; menuItemId: number; qty: number }) =>
      addItemToOrder(orderId, {
        menuItemId,
        quantity: qty,
        customisations: customisation || undefined,
      }),
    onSuccess: (order) => {
      setCurrentOrder(order)
      setCustomisation('')
      toast.success('Item added')
    },
    onError: () => toast.error('Failed to add item'),
  })

  const removeItem = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      removeItemFromOrder(orderId, itemId),
    onSuccess: (order) => {
      setCurrentOrder(order)
      toast.success('Item removed')
    },
    onError: () => toast.error('Cannot remove item'),
  })

  const submit = useMutation({
    mutationFn: submitOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      setCurrentOrder(null)
      setSelectedTableId(null)
      setSearch('')
      toast.success('Order sent to kitchen!')
    },
    onError: () => toast.error('Failed to submit order'),
  })

  // Refresh order data
  const refreshOrder = async () => {
    if (!currentOrder) return
    try {
      const updated = await getOrder(currentOrder.id)
      setCurrentOrder(updated)
    } catch { /* ignore */ }
  }

  const handleCancel = () => {
    setCurrentOrder(null)
    setSelectedTableId(null)
    setSearch('')
    setQuantities({})
  }

  const getQty = (id: number) => quantities[id] || 1
  const setQty = (id: number, v: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, v) }))

  // Group menu by category
  const categoryMap = filteredMenu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    ;(acc[cat] ??= []).push(item)
    return acc
  }, {})

  const orderTotal = currentOrder?.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity, 0
  ) ?? 0

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">New Order</h1>
        <p className="page-subtitle">Select a table and build an order from the menu</p>
      </div>

      {/* Step 1: Table selection */}
      {!currentOrder ? (
        <div className="card p-6 max-w-lg">
          <h2 className="text-sm font-bold text-surface-900 mb-4">Select table</h2>
          {occupiedTables.length === 0 ? (
            <p className="text-sm text-surface-500 mb-4">
              No occupied tables. Seat a customer first from the Tables page.
            </p>
          ) : (
            <div className="space-y-2 mb-4">
              {occupiedTables.map((t: Table) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                    selectedTableId === t.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20'
                      : 'border-surface-200 hover:border-surface-300 text-surface-700'
                  }`}
                >
                  <span className="font-semibold">Table {t.tableNumber}</span>
                  <span className="text-xs text-surface-500">{t.capacity} seats</span>
                </button>
              ))}
            </div>
          )}
          <button
            disabled={!selectedTableId}
            onClick={() => startOrder.mutate({ tableId: selectedTableId! })}
            className="btn-primary w-full"
          >
            Open order
            <ChevronRight size={15} />
          </button>
        </div>
      ) : (
        /* Step 2: Menu browser + order summary */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu (left 2 cols) */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-surface-900">Menu</h2>
              <span className="badge badge-brand">Order #{currentOrder.id}</span>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                className="input pl-10"
                placeholder="Search dishes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Customisation */}
            <div className="mb-5">
              <input
                className="input text-xs"
                placeholder="Customisation notes (optional) — e.g. no onions, extra spicy…"
                value={customisation}
                onChange={(e) => setCustomisation(e.target.value)}
              />
            </div>

            {/* Menu items */}
            <div className="space-y-6 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
              {Object.entries(categoryMap).map(([cat, items]) => (
                <div key={cat}>
                  <div className="section-label">{cat}</div>
                  <div className="space-y-1">
                    {items.map((item: MenuItem) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-surface-50 group transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-surface-900 truncate">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-surface-500">
                              &pound;{item.price.toFixed(2)}
                            </span>
                            {item.allergens && (
                              <span className="flex items-center gap-1 text-[11px] text-orange-600 font-medium">
                                <AlertTriangle size={10} />
                                {item.allergens}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity + Add */}
                        <div className="ml-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setQty(item.id, getQty(item.id) - 1)}
                              className="px-2 py-1 hover:bg-surface-100 text-surface-500"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-bold text-surface-900 tabular-nums min-w-[24px] text-center">
                              {getQty(item.id)}
                            </span>
                            <button
                              onClick={() => setQty(item.id, getQty(item.id) + 1)}
                              className="px-2 py-1 hover:bg-surface-100 text-surface-500"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              addItem.mutate({
                                orderId: currentOrder.id,
                                menuItemId: item.id,
                                qty: getQty(item.id),
                              })
                            }
                            disabled={addItem.isPending}
                            className="btn-primary btn-sm"
                          >
                            <Plus size={12} />
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredMenu.length === 0 && (
                <div className="empty-state py-10">
                  <p className="text-sm">No items match your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Order summary (right col) */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <h2 className="text-sm font-bold text-surface-900 mb-3">
                Order summary
              </h2>

              {currentOrder.items.length === 0 ? (
                <div className="text-center py-8 text-surface-400">
                  <ShoppingBag size={24} className="mx-auto mb-2 text-surface-300" />
                  <p className="text-xs">No items yet</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm py-1.5"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-surface-900 tabular-nums mr-1.5">
                          {item.quantity}&times;
                        </span>
                        <span className="text-surface-700">{item.menuItem.name}</span>
                        {item.customisations && (
                          <div className="text-[11px] text-surface-400 mt-0.5 italic">
                            {item.customisations}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs font-semibold text-surface-700 tabular-nums">
                          &pound;{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            removeItem.mutate({
                              orderId: currentOrder.id,
                              itemId: item.id,
                            })
                          }
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="divider" />
                  <div className="flex justify-between font-bold text-surface-900 pt-1">
                    <span>Subtotal</span>
                    <span className="tabular-nums">&pound;{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => submit.mutate(currentOrder.id)}
                disabled={submit.isPending || currentOrder.items.length === 0}
                className="btn-success w-full"
              >
                <Send size={15} />
                Send to kitchen
              </button>
            </div>

            <button onClick={handleCancel} className="btn-danger w-full">
              <X size={14} />
              Cancel order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
