import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAllMenu, createMenuItem, toggleAvailability, deleteMenuItem } from '../api/menu'
import { MenuItem } from '../types'
import toast from 'react-hot-toast'
import { Plus, Eye, EyeOff, BookOpen, Search, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES = [
  { value: 'STARTER',     label: 'Starter' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT',     label: 'Dessert' },
  { value: 'BEVERAGE',    label: 'Beverage' },
]

export default function MenuAdminPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    category: 'STARTER',
    name: '',
    description: '',
    price: '',
  })

  const { data: menu = [], isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: fetchAllMenu,
  })

  const create = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] })
      setShowForm(false)
      setForm({ category: 'STARTER', name: '', description: '', price: '' })
      toast.success('Menu item created (Factory Method)')
    },
    onError: () => toast.error('Failed to create item'),
  })

  const toggle = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      toggleAvailability(id, available),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] })
      toast.success('Availability updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const remove = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] })
      toast.success('Item deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleCreate = () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    create.mutate({
      category: form.category, // backend does toUpperCase(), MAIN_COURSE ✓
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
    })
  }

  const items = (menu as MenuItem[]).filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    ;(acc[cat] ??= []).push(item)
    return acc
  }, {})

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-surface-400 text-sm">Loading menu…</div>
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">
            {items.length} item{items.length !== 1 ? 's' : ''} &middot; Create items using Factory Method pattern
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} />
          Add item
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 mb-6 animate-slide-up">
          <h2 className="text-sm font-bold text-surface-900 mb-4">
            New menu item
            <span className="text-xs font-normal text-surface-400 ml-2">(Factory Method Pattern)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                placeholder="e.g. Caesar Salad"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Description</label>
              <input
                className="input"
                placeholder="Brief description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Price (&pound;) *</label>
              <input
                type="number"
                className="input"
                placeholder="12.99"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={create.isPending} className="btn-primary btn-sm">
              Create item
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          className="input pl-10"
          placeholder="Search menu items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Menu list grouped by category */}
      {Object.entries(grouped).length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BookOpen size={22} className="text-surface-400" />
          </div>
          <p className="text-sm font-medium">No menu items found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <div className="section-label">{cat}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={clsx(
                      'card-hover p-4 flex items-start justify-between',
                      !item.available && 'opacity-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-surface-900 truncate">
                        {item.name}
                      </div>
                      {item.description && (
                        <p className="text-xs text-surface-500 mt-0.5 truncate">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-bold text-brand-600">
                          &pound;{item.price.toFixed(2)}
                        </span>
                        <span className={clsx('badge', item.available ? 'badge-green' : 'badge-red')}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (confirm('Delete this item permanently?')) remove.mutate(item.id)
                        }}
                        disabled={remove.isPending}
                        className="btn-icon text-surface-400 hover:text-red-500"
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => toggle.mutate({ id: item.id, available: !item.available })}
                        disabled={toggle.isPending}
                        className={clsx('btn-icon', item.available ? 'text-surface-400 hover:text-red-500' : 'text-surface-400 hover:text-emerald-500')}
                        title={item.available ? 'Mark unavailable' : 'Mark available'}
                      >
                        {item.available ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
