import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchReservations, createReservation, checkInReservation, cancelReservation } from '../api/reservations'
import { fetchTables } from '../api/tables'
import { Reservation, Table } from '../types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { CalendarClock, Plus, UserCheck, X, Clock, Users } from 'lucide-react'
import clsx from 'clsx'

const statusBadge: Record<string, string> = {
  CONFIRMED: 'badge-blue',
  ARRIVED:   'badge-green',
  CANCELLED: 'badge-red',
  EXPIRED:   'badge-gray',
  COMPLETED: 'badge-gray',
}

export default function ReservationsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
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

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
  })

  const freeTables = (tables as Table[]).filter((t) => t.status === 'FREE')

  const create = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      setShowForm(false)
      setForm({ tableId: '', customerName: '', customerPhone: '', partySize: '2', scheduledAt: '' })
      toast.success('Reservation created')
    },
    onError: () => toast.error('Failed to create reservation'),
  })

  const checkIn = useMutation({
    mutationFn: checkInReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Guest checked in')
    },
    onError: () => toast.error('Check-in failed'),
  })

  const cancel = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast.success('Reservation cancelled')
    },
    onError: () => toast.error('Failed to cancel'),
  })

  const handleCreate = () => {
    if (!form.tableId || !form.customerName || !form.scheduledAt) {
      toast.error('Please fill in required fields')
      return
    }
    create.mutate({
      tableId: parseInt(form.tableId),
      customerName: form.customerName,
      customerPhone: form.customerPhone || undefined,
      partySize: parseInt(form.partySize) || 2,
      scheduledAt: form.scheduledAt,
    })
  }

  const r = reservations as Reservation[]

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-surface-400 text-sm">Loading reservations…</div>
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Reservations</h1>
          <p className="page-subtitle">{r.length} reservation{r.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} />
          New reservation
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 mb-6 animate-slide-up">
          <h2 className="text-sm font-bold text-surface-900 mb-4">New reservation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="label">Table *</label>
              <select
                className="select"
                value={form.tableId}
                onChange={(e) => setForm({ ...form, tableId: e.target.value })}
              >
                <option value="">Select…</option>
                {freeTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.tableNumber} ({t.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Guest name *</label>
              <input
                className="input"
                placeholder="John Smith"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                placeholder="+44 7700 900000"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Party size</label>
              <input
                type="number"
                className="input"
                min="1"
                value={form.partySize}
                onChange={(e) => setForm({ ...form, partySize: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date &amp; time *</label>
              <input
                type="datetime-local"
                className="input"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={create.isPending} className="btn-primary btn-sm">
              Create reservation
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reservations list */}
      {r.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarClock size={22} className="text-surface-400" />
          </div>
          <p className="text-sm font-medium">No reservations yet</p>
          <p className="text-xs mt-1">Create one using the button above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {r.map((res) => (
            <div key={res.id} className="card-hover flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={18} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-surface-900">{res.customerName}</div>
                  <div className="flex items-center gap-3 text-xs text-surface-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {format(new Date(res.reservationTime), 'dd MMM · HH:mm')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {res.partySize} guests
                    </span>
                    <span>Table {res.table.tableNumber}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx('badge', statusBadge[res.status] || 'badge-gray')}>
                  {res.status}
                </span>
                {res.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => checkIn.mutate(res.id)}
                      disabled={checkIn.isPending}
                      className="btn-success btn-sm"
                    >
                      <UserCheck size={13} />
                      Check in
                    </button>
                    <button
                      onClick={() => cancel.mutate(res.id)}
                      disabled={cancel.isPending}
                      className="btn-danger btn-sm"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
