import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, clearTable } from '../api/tables'
import { fetchOrdersByTable } from '../api/orders'
import { generateBill, applyTip, splitBill, markBillPaid } from '../api/billing'
import { Bill, Table } from '../types'
import toast from 'react-hot-toast'
import { CreditCard, Receipt, Users, Percent, CheckCircle2, ChevronRight } from 'lucide-react'

const strategies = [
  { value: 'STANDARD',     label: 'Standard',         desc: 'Regular pricing' },
  { value: 'HAPPY_HOUR',   label: 'Happy Hour',        desc: '20% off total' },
  { value: 'LOYALTY_CARD', label: 'Loyalty Card',      desc: '10% off + free drink' },
]

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
    onSuccess: (data) => { setBill(data); setTipAmount(''); toast.success('Tip applied') },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Generate bills, apply discounts, and process payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — setup */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Setup</h2>

          {/* Table selector */}
          <div>
            <label className="label">Table</label>
            {occupiedTables.length === 0 ? (
              <p className="text-sm text-slate-500">No tables awaiting bill.</p>
            ) : (
              <div className="space-y-2">
                {occupiedTables.map((t: Table) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTableId(t.id); setBill(null) }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selectedTableId === t.id
                        ? 'border-biteplate-500 bg-biteplate-50 text-biteplate-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">Table {t.tableNumber}</span>
                    <span className={`badge ${
                      t.status === 'AWAITING_BILL' ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {t.status === 'AWAITING_BILL' ? 'Awaiting Bill' : 'Occupied'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing strategy */}
          <div>
            <label className="label">Pricing strategy</label>
            <div className="space-y-2">
              {strategies.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStrategy(s.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                    strategy === s.value
                      ? 'border-biteplate-500 bg-biteplate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-slate-900">{s.label}</div>
                    <div className="text-xs text-slate-500">{s.desc}</div>
                  </div>
                  {strategy === s.value && <ChevronRight size={14} className="text-biteplate-600" />}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!selectedTableId || !latestOrder}
            onClick={() => genBill.mutate({ orderId: latestOrder?.id })}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Receipt size={15} />
            Generate bill
          </button>
        </div>

        {/* Right — bill */}
        {bill ? (
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Bill #{bill.id}</h2>
              <span className="badge bg-amber-100 text-amber-700">Unpaid</span>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {bill.lineItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-slate-700">
                  <span>{item.description}</span>
                  <span className="font-medium tabular-nums">£{item.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span className="tabular-nums">£{bill.total.toFixed(2)}</span>
              </div>
              {bill.splitCount > 1 && (
                <div className="text-right text-sm text-slate-500">
                  Per guest: <span className="font-semibold text-slate-700 tabular-nums">£{(bill.total / bill.splitCount).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Tip */}
            <div>
              <label className="label flex items-center gap-1"><Percent size={12} /> Add tip</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (£)"
                  className="input"
                  value={tipAmount}
                  onChange={e => setTipAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <button onClick={() => tip.mutate()} disabled={!tipAmount} className="btn-secondary whitespace-nowrap">
                  Apply
                </button>
              </div>
            </div>

            {/* Split */}
            <div>
              <label className="label flex items-center gap-1"><Users size={12} /> Split bill</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="No. of guests"
                  className="input"
                  value={guestCount}
                  onChange={e => setGuestCount(e.target.value)}
                  min="1"
                />
                <button onClick={() => split.mutate()} disabled={!guestCount} className="btn-secondary whitespace-nowrap">
                  Split
                </button>
              </div>
            </div>

            {/* Pay */}
            <button
              onClick={() => pay.mutate()}
              disabled={pay.isPending}
              className="btn-success w-full flex items-center justify-center gap-2 py-3"
            >
              <CheckCircle2 size={16} />
              <CreditCard size={16} />
              Process payment
            </button>
          </div>
        ) : (
          <div className="card p-6 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
            <Receipt size={40} className="mb-3 text-slate-200" />
            <p className="text-sm font-medium">No bill generated yet</p>
            <p className="text-xs mt-1">Select a table and click "Generate bill"</p>
          </div>
        )}
      </div>
    </div>
  )
}
