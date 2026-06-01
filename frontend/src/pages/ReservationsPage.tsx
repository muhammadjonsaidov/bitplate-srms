import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchReservations,
  createReservation,
  checkInReservation,
  cancelReservation,
} from '../api/reservations'
import { fetchTables } from '../api/tables'
import { Reservation, ReservationStatus, Table } from '../types'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { CalendarDays, Plus, LogIn, X, Users, Clock } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

const statusConfig: Record<ReservationStatus, { label: string; badge: string }> = {
  CONFIRMED:  { label: 'Confirmed',  badge: 'bg-blue-100 text-blue-700' },
  ARRIVED:    { label: 'Arrived',    badge: 'bg-emerald-100 text-emerald-700' },
  COMPLETED:  { label: 'Completed',  badge: 'bg-slate-100 text-slate-600' },
  CANCELLED:  { label: 'Cancelled',  badge: 'bg-red-100 text-red-600' },
  EXPIRED:    { label: 'Expired',    badge: 'bg-orange-100 text-orange-700' },
}

export default function ReservationsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    partySize: '2',
    scheduledAt: '',
  })

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
    refetchInterval: 30_000,
  })
  const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: fetchTables })

  const freeTables = (tables as Table[]).filter(t => t.status === 'FREE' || t.status === 'RESERVED')
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['reservations'] })
    qc.invalidateQueries({ queryKey: ['tables'] })
  }

  const create = useMutation({
    mutationFn: () => createReservation({
      tableId: parseInt(form.tableId),
      customerName: form.customerName,
      customerPhone: form.customerPhone || undefined,
      partySize: parseInt(form.partySize),
      scheduledAt: new Date(form.scheduledAt).toISOString().replace('Z', ''),
    }),
    onSuccess: () => {
      inv()
      setShowModal(false)
      setForm({ tableId: '', customerName: '', customerPhone: '', partySize: '2', scheduledAt: '' })
      toast.success('Reservation created')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create reservation'),
  })

  const checkIn = useMutation({
    mutationFn: checkInReservation,
    onSuccess: () => { inv(); toast.success('Customer checked in') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to check in'),
  })

  const cancel = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => { inv(); toast.success('Reservation cancelled') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to cancel'),
  })

  const list = reservations as Reservation[]
  const active = list.filter(r => r.status === 'CONFIRMED')
  const past   = list.filter(r => r.status !== 'CONFIRMED')

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading reservations…</div>
  )

  const canSubmit = form.tableId && form.customerName && form.partySize && form.scheduledAt

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-sm text-slate-500 mt-1">{active.length} upcoming · {list.length} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} />
          New reservation
        </button>
      </div>

      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="space-y-3">
            {active.map(r => <ReservationCard key={r.id} r={r} onCheckIn={() => checkIn.mutate(r.id)} onCancel={() => cancel.mutate(r.id)} busy={checkIn.isPending || cancel.isPending} />)}
          </div>
        </section>
      )}

      {active.length === 0 && past.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <CalendarDays size={40} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium">No reservations yet</p>
          <p className="text-xs mt-1">Create one using the button above</p>
        </div>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Past / Cancelled</h2>
          <div className="space-y-2">
            {past.map(r => <ReservationCard key={r.id} r={r} past />)}
          </div>
        </section>
      )}

      {showModal && (
        <Modal title="New Reservation" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Table</label>
              <select
                className="input"
                value={form.tableId}
                onChange={e => setForm(f => ({ ...f, tableId: e.target.value }))}
              >
                <option value="">Select table…</option>
                {freeTables.map((t: Table) => (
                  <option key={t.id} value={t.id}>
                    Table {t.tableNumber} (cap. {t.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Customer name</label>
              <input
                type="text"
                className="input"
                placeholder="Full name"
                value={form.customerName}
                onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <input
                type="tel"
                className="input"
                placeholder="+44 7700 900000"
                value={form.customerPhone}
                onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Party size</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={form.partySize}
                  onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Date &amp; time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                />
              </div>
            </div>

            <button
              onClick={() => create.mutate()}
              disabled={!canSubmit || create.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {create.isPending ? <Spinner size={16} /> : <CalendarDays size={15} />}
              Create reservation
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ReservationCard({
  r, onCheckIn, onCancel, busy = false, past = false,
}: {
  r: Reservation; onCheckIn?: () => void; onCancel?: () => void; busy?: boolean; past?: boolean
}) {
  const cfg = statusConfig[r.status] ?? { label: r.status, badge: 'bg-slate-100 text-slate-600' }
  const scheduled = parseISO(r.scheduledAt)

  return (
    <div className={clsx('card p-4 flex items-center gap-4', past && 'opacity-60')}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center flex-shrink-0 text-center">
        <div className="text-lg font-bold text-slate-900 leading-none">{format(scheduled, 'd')}</div>
        <div className="text-[10px] text-slate-500 uppercase">{format(scheduled, 'MMM')}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">{r.customerName}</span>
          <span className={clsx('badge', cfg.badge)}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {format(scheduled, 'HH:mm')}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {r.partySize} guests
          </span>
          <span>Table {r.table.tableNumber}</span>
          {r.customerPhone && <span>{r.customerPhone}</span>}
        </div>
      </div>

      {!past && r.status === 'CONFIRMED' && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onCheckIn}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors font-medium disabled:opacity-40"
          >
            <LogIn size={13} />
            Check in
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs btn-danger px-3 py-2"
          >
            <X size={13} />
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
