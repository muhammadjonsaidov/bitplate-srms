import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { fetchMenu } from '../api/menu'
import { createOrder, addItemToOrder, submitOrder } from '../api/orders'
import { MenuItem, Table } from '../types'
import toast from 'react-hot-toast'

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
    onSuccess: (order) => { setCurrentOrderId(order.id); toast.success(`Order #${order.id} created`) },
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Place Order</h2>
      {!currentOrderId ? (
        <div className="bg-white rounded-xl shadow p-6 max-w-md">
          <label className="block text-sm font-medium mb-2">Select Occupied Table</label>
          <select className="w-full border rounded-lg px-3 py-2 mb-4"
            value={selectedTableId ?? ''} onChange={e => setSelectedTableId(Number(e.target.value))}>
            <option value="">— Choose table —</option>
            {occupiedTables.map((t: Table) => (
              <option key={t.id} value={t.id}>Table {t.tableNumber} (cap {t.capacity})</option>
            ))}
          </select>
          <button disabled={!selectedTableId} onClick={() => startOrder.mutate({ tableId: selectedTableId! })}
            className="w-full bg-biteplate-600 text-white py-2 rounded-lg disabled:opacity-40">
            Start Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-3">Order #{currentOrderId} — Add Items</h3>
            <input className="w-full border rounded px-3 py-2 text-sm mb-3" placeholder="Search menu…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMenu.map((item: MenuItem) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">£{item.price.toFixed(2)} · {item.dtype}</div>
                    {item.allergens && <div className="text-xs text-orange-600">⚠️ {item.allergens}</div>}
                  </div>
                  <button onClick={() => addItem.mutate({ orderId: currentOrderId, menuItemId: item.id })}
                    className="text-xs bg-biteplate-600 text-white px-3 py-1 rounded">Add</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4">Submit Order</h3>
            <p className="text-sm text-gray-500 mb-4">When done adding items, submit to kitchen.</p>
            <button onClick={() => submit.mutate(currentOrderId)}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium">
              ✓ Send to Kitchen
            </button>
            <button onClick={() => { setCurrentOrderId(null); setSelectedTableId(null) }}
              className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
