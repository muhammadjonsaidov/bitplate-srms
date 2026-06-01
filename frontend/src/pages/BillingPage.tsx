import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, clearTable } from '../api/tables'
import { fetchOrdersByTable } from '../api/orders'
import { generateBill, applyTip, splitBill, markBillPaid } from '../api/billing'
import { Bill, Table, PricingStrategy, PRICING_STRATEGIES } from '../types'
import toast from 'react-hot-toast'
import { CreditCard, Receipt, Users, Percent, CheckCircle2, Banknote } from 'lucide-react'
import clsx from 'clsx'

export default function BillingPage() {
  const qc = useQueryClient()
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [bill, setBill] = useState<Bill | null>(null)
  const [strategy, setStrategy] = useState<PricingStrategy>('STANDARD')
  const [tipAmount, setTipAmount] = useState('')
  const [guestCount, setGuestCount] = useState('')

  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables })
  const { data: tableOrders = [] } = useQuery({
    queryKey: ['orders-table', selectedTableId],
    queryFn: () => fetchOrdersByTable(selectedTableId!),
    enabled: !!selectedTableId,
  })

  const billableTables = (tables as Table[]).filter(
    (t) => t.status === 'OCCUPIED' || t.status === 'AWAITING_BILL'
  )
  const latestOrder = (tableOrders as any[])[0]

  const genBill = useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => generateBill(orderId, strategy),
    onSuccess: (data) => { setBill(data); toast.success('Bill generated') },
    onError: () => toast.error('Failed to generate bill'),
  })

  const tipMut = useMutation({
    mutationFn: () => applyTip(bill!.id, parseFloat(tipAmount) || 0),
    onSuccess: (data) => { setBill(data); setTipAmount(''); toast.success('Tip applied') },
  })

  const splitMut = useMutation({
    mutationFn: () => splitBill(bill!.id, parseInt(guestCount) || 1),
    onSuccess: (data) => { setBill(data); toast.success('Bill split') },
  })

  const payMut = useMutation({
    mutationFn: () => markBillPaid(bill!.id),
    onSuccess: async () => {
      if (selectedTableId) {
        try { await clearTable(selectedTableId) } catch { /* ignore */ }
      }
      qc.invalidateQueries({ queryKey: ['tables'] })
      setBill(null)
      setSelectedTableId(null)
      toast.success('Payment processed — table cleared')
    },
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Billing</h1>
        <p className="page-subtitle">Generate bills, apply discounts, and process payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — setup */}
        <div className="card p-6 space-y-6">
          <h2 className="text-sm font-bold text-surface-900">Setup</h2>

          {/* Table */}
          <div>
            <label className="label">Select table</label>
            {billableTables.length === 0 ? (
              <p className="text-sm text-surface-500">No tables awaiting bill.</p>
            ) : (
              <div className="space-y-2">
                {billableTables.map((t: Table) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTableId(t.id); setBill(null) }}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all',
                      selectedTableId === t.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20'
                        : 'border-surface-200 hover:border-surface-300 text-surface-700'
                    )}
                  >
                    <span className="font-semibold">Table {t.tableNumber}</span>
                    <span className={clsx('badge', t.status === 'AWAITING_BILL' ? 'badge-amber' : 'badge-orange')}>
                      {t.status === 'AWAITING_BILL' ? 'Awaiting bill' : 'Occupied'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Strategy (STRATEGY PATTERN) */}
          <div>
            <label className="label">Pricing strategy</label>
            <div className="space-y-2">
              {PRICING_STRATEGIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStrategy(s.value)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all',
                    strategy === s.value
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500/20'
                      : 'border-surface-200 hover:border-surface-300'
                  )}
                >
                  <div className="text-left">
                    <div className="font-semibold text-surface-900">{s.label}</div>
                    <div className="text-xs text-surface-500">{s.description}</div>
                  </div>
                  {strategy === s.value && (
                    <CheckCircle2 size={16} className="text-brand-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!selectedTableId || !latestOrder}
            onClick={() => genBill.mutate({ orderId: latestOrder?.id })}
            className="btn-primary w-full"
          >
            <Receipt size={15} />
            Generate bill
          </button>
        </div>

        {/* Right — bill preview */}
        {bill ? (
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Bill #{bill.id}</h2>
              <span className={clsx('badge', bill.paid ? 'badge-green' : 'badge-amber')}>
                {bill.paid ? 'Paid' : 'Unpaid'}
              </span>
            </div>

            {/* Strategy badge */}
            <div className="badge badge-brand">
              <Banknote size={12} />
              {bill.pricingStrategy} pricing
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {bill.lineItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-surface-700">
                  <span>{item.description}</span>
                  <span className="font-semibold tabular-nums">&pound;{item.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="flex justify-between text-xs text-surface-500">
                <span>Subtotal</span>
                <span className="tabular-nums">&pound;{bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-surface-500">
                <span>Tax</span>
                <span className="tabular-nums">&pound;{bill.tax.toFixed(2)}</span>
              </div>
              {bill.tip > 0 && (
                <div className="flex justify-between text-xs text-surface-500">
                  <span>Tip</span>
                  <span className="tabular-nums">&pound;{bill.tip.toFixed(2)}</span>
                </div>
              )}
              <div className="divider" />
              <div className="flex justify-between font-bold text-lg text-surface-900">
                <span>Total</span>
                <span className="tabular-nums">&pound;{bill.total.toFixed(2)}</span>
              </div>
              {bill.splitCount > 1 && (
                <div className="text-right text-xs text-surface-500">
                  Per guest: <span className="font-bold text-surface-700 tabular-nums">
                    &pound;{(bill.total / bill.splitCount).toFixed(2)}
                  </span>
                  &ensp;({bill.splitCount} guests)
                </div>
              )}
            </div>

            {/* Tip */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Percent size={11} /> Add tip
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (&pound;)"
                  className="input"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <button onClick={() => tipMut.mutate()} disabled={!tipAmount} className="btn-secondary whitespace-nowrap">
                  Apply
                </button>
              </div>
            </div>

            {/* Split */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Users size={11} /> Split bill
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="No. of guests"
                  className="input"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  min="2"
                />
                <button onClick={() => splitMut.mutate()} disabled={!guestCount} className="btn-secondary whitespace-nowrap">
                  Split
                </button>
              </div>
            </div>

            {/* Pay */}
            <button
              onClick={() => payMut.mutate()}
              disabled={payMut.isPending || bill.paid}
              className="btn-success w-full py-3"
            >
              <CreditCard size={16} />
              Process payment
            </button>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center min-h-[400px] text-surface-400">
            <div className="empty-state-icon mb-3">
              <Receipt size={22} className="text-surface-400" />
            </div>
            <p className="text-sm font-medium">No bill generated yet</p>
            <p className="text-xs mt-1">Select a table and click "Generate bill"</p>
          </div>
        )}
      </div>
    </div>
  )
}
