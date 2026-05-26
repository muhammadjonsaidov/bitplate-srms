import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, clearTable } from '../api/tables'
import { fetchOrdersByTable } from '../api/orders'
import { generateBill, applyTip, splitBill, markBillPaid } from '../api/billing'
import { Bill, Table } from '../types'
import toast from 'react-hot-toast'

export default function BillingPage() {
  const qc = useQueryClient()
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [bill, setBill] = useState<Bill | null>(null)
  const [strategy, setStrategy] = useState('STANDARD')
  const [tipAmount, setTipAmount] = useState('')
  const [guestCount, setGuestCount] = useState('')

  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables })
  const { data: tableOrders = [] } = useQuery({
    queryKey: ['orders-table', selectedTableId],
    queryFn: () => fetchOrdersByTable(selectedTableId!),
    enabled: !!selectedTableId,
  })

  const occupiedTables = (tables as Table[]).filter(t =>
    t.status === 'OCCUPIED' || t.status === 'AWAITING_BILL'
  )
  const latestOrder = (tableOrders as any[])[0]

  const genBill = useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => generateBill(orderId, strategy),
    onSuccess: (data) => { setBill(data); toast.success('Bill generated') },
    onError: () => toast.error('Failed to generate bill'),
  })

  const tip = useMutation({
    mutationFn: () => applyTip(bill!.id, parseFloat(tipAmount) || 0),
    onSuccess: (data) => { setBill(data); toast.success('Tip applied') },
  })

  const split = useMutation({
    mutationFn: () => splitBill(bill!.id, parseInt(guestCount) || 1),
    onSuccess: (data) => { setBill(data); toast.success('Bill split') },
  })

  const pay = useMutation({
    mutationFn: () => markBillPaid(bill!.id),
    onSuccess: async () => {
      if (selectedTableId) await clearTable(selectedTableId)
      qc.invalidateQueries({ queryKey: ['tables'] })
      setBill(null); setSelectedTableId(null)
      toast.success('Payment processed — table cleared')
    },
  })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Billing & POS</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Select Table</h3>
          <select className="w-full border rounded-lg px-3 py-2 mb-4"
            value={selectedTableId ?? ''} onChange={e => { setSelectedTableId(Number(e.target.value)); setBill(null) }}>
            <option value="">— Choose table —</option>
            {occupiedTables.map((t: Table) => (
              <option key={t.id} value={t.id}>Table {t.tableNumber} ({t.status})</option>
            ))}
          </select>
          <label className="block text-sm font-medium mb-1">Pricing Strategy</label>
          <select className="w-full border rounded-lg px-3 py-2 mb-4"
            value={strategy} onChange={e => setStrategy(e.target.value)}>
            <option value="STANDARD">Standard</option>
            <option value="HAPPY_HOUR">Happy Hour (20% off)</option>
            <option value="LOYALTY_CARD">Loyalty Card (10% + free drink)</option>
          </select>
          <button disabled={!selectedTableId || !latestOrder}
            onClick={() => genBill.mutate({ orderId: latestOrder?.id })}
            className="w-full bg-biteplate-600 text-white py-2 rounded-lg disabled:opacity-40">
            Generate Bill
          </button>
        </div>

        {bill && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4">Bill #{bill.id}</h3>
            <div className="space-y-1 mb-4">
              {bill.lineItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span>£{item.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span><span>£{bill.total.toFixed(2)}</span>
              </div>
              {bill.splitCount > 1 && (
                <div className="text-sm text-gray-500 text-right">
                  Per guest: £{(bill.total / bill.splitCount).toFixed(2)}
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-2">
              <input type="number" placeholder="Tip £" className="flex-1 border rounded px-2 py-1 text-sm"
                value={tipAmount} onChange={e => setTipAmount(e.target.value)} />
              <button onClick={() => tip.mutate()} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded">
                Add Tip
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input type="number" placeholder="Guests" className="flex-1 border rounded px-2 py-1 text-sm"
                value={guestCount} onChange={e => setGuestCount(e.target.value)} />
              <button onClick={() => split.mutate()} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">
                Split
              </button>
            </div>
            <button onClick={() => pay.mutate()}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium">
              ✓ Process Payment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
