import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllMenuItems, createMenuItem, toggleMenuItemAvailability, deleteMenuItem } from '../api/menu'
import { MenuItem } from '../types'
import toast from 'react-hot-toast'
import { Plus, Search, ToggleLeft, ToggleRight, AlertTriangle, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

const CATEGORIES = ['FOOD', 'DRINK', 'DESSERT']

export default function MenuAdminPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    category: 'FOOD',
    name: '',
    description: '',
    price: '',
  })

  const { data: menu = [], isLoading } = useQuery({
    queryKey: ['menu-admin'],
    queryFn: fetchAllMenuItems,
  })

  const inv = () => {
    qc.invalidateQueries({ queryKey: ['menu-admin'] })
    qc.invalidateQueries({ queryKey: ['menu'] })
  }

  const create = useMutation({
    mutationFn: () => createMenuItem({
      category: form.category,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
    }),
    onSuccess: () => {
      inv()
      setShowModal(false)
      setForm({ category: 'FOOD', name: '', description: '', price: '' })
      toast.success('Menu item created')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create item'),
  })

  const toggle = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      toggleMenuItemAvailability(id, available),
    onSuccess: (item) => {
      inv()
      toast.success(`${item.name} marked ${item.available ? 'available' : 'unavailable'}`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to update'),
  })

  const remove = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => { inv(); toast.success('Item deleted') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to delete'),
  })

  const items = menu as MenuItem[]
  const filtered = items.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
  const byCategory = filtered.reduce<Record<string, MenuItem[]>>((acc, m) => {
    const cat = m.dtype ?? 'Other'
    ;(acc[cat] ??= []).push(m)
    return acc
  }, {})

  const available = items.filter(m => m.available).length
  const canSubmit = form.name && form.price && parseFloat(form.price) > 0

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading menu…</div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} items · {available} available · {items.length - available} unavailable
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} />
          Add item
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search menu…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {Object.entries(byCategory).map(([cat, catItems]) => (
        <section key={cat}>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{cat}</h2>
          <div className="card divide-y divide-slate-100">
            {catItems.map((item: MenuItem) => (
              <div
                key={item.id}
                className={clsx(
                  'flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors',
                  !item.available && 'opacity-50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 text-sm">{item.name}</span>
                    {!item.available && (
                      <span className="badge bg-slate-100 text-slate-500">Unavailable</span>
                    )}
                    {item.allergens && (
                      <span className="flex items-center gap-1 text-xs text-orange-600">
                        <AlertTriangle size={11} />
                        {item.allergens}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-900 tabular-nums flex-shrink-0">
                  £{item.price.toFixed(2)}
                </div>

                <button
                  onClick={() => toggle.mutate({ id: item.id, available: !item.available })}
                  disabled={toggle.isPending}
                  className={clsx(
                    'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 disabled:opacity-40',
                    item.available
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {item.available
                    ? <><ToggleRight size={14} /> Available</>
                    : <><ToggleLeft size={14} /> Unavailable</>
                  }
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.name}"? This cannot be undone.`)) {
                      remove.mutate(item.id)
                    }
                  }}
                  disabled={remove.isPending}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 flex-shrink-0"
                  title="Delete item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <p className="text-sm font-medium">No items found</p>
          <p className="text-xs mt-1">Try a different search or add a new item</p>
        </div>
      )}

      {showModal && (
        <Modal title="Add Menu Item" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Grilled Salmon"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Description (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="Short description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Price (£)</label>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>

            <button
              onClick={() => create.mutate()}
              disabled={!canSubmit || create.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {create.isPending ? <Spinner size={16} /> : <Plus size={15} />}
              Add to menu
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
