import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth'
import toast from 'react-hot-toast'
import {
  LayoutGrid,
  ClipboardList,
  ChefHat,
  CreditCard,
  BarChart3,
  CalendarClock,
  UtensilsCrossed,
  LogOut,
  BookOpen,
} from 'lucide-react'
import { ROLE_LABELS, StaffRole } from '../../types'

const navSections: {
  label: string
  items: { path: string; label: string; icon: typeof LayoutGrid; roles: StaffRole[] }[]
}[] = [
  {
    label: 'Operations',
    items: [
      { path: '/tables',       label: 'Tables',       icon: LayoutGrid,    roles: ['MANAGER', 'WAITER', 'CASHIER'] },
      { path: '/reservations', label: 'Reservations', icon: CalendarClock, roles: ['MANAGER', 'WAITER'] },
      { path: '/orders',       label: 'Orders',       icon: ClipboardList, roles: ['MANAGER', 'WAITER'] },
      { path: '/kitchen',      label: 'Kitchen',      icon: ChefHat,       roles: ['MANAGER', 'HEAD_CHEF'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/billing',   label: 'Billing',   icon: CreditCard, roles: ['MANAGER', 'CASHIER'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/menu-admin', label: 'Menu',      icon: BookOpen,  roles: ['MANAGER', 'HEAD_CHEF'] },
      { path: '/dashboard',  label: 'Dashboard', icon: BarChart3, roles: ['MANAGER'] },
    ],
  },
]

export default function Sidebar() {
  const { staff, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
    toast.success('Signed out')
  }

  const initials = staff?.name
    ? staff.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <aside className="w-[240px] bg-sidebar text-surface-300 flex flex-col flex-shrink-0 select-none">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-600/20">
          <UtensilsCrossed size={17} className="text-white" />
        </div>
        <div>
          <div className="font-display text-[15px] font-semibold text-white tracking-tight">
            BitePlate
          </div>
          <div className="text-[10px] text-surface-500 uppercase tracking-[0.12em] font-semibold">
            Smart Restaurant
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => {
          const allowed = section.items.filter(
            (item) => staff && item.roles.includes(staff.role)
          )
          if (allowed.length === 0) return null
          return (
            <div key={section.label}>
              <div className="text-[10px] font-bold text-surface-600 uppercase tracking-[0.1em] px-3 mb-1.5">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {allowed.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-600/90 text-white shadow-sm shadow-brand-600/20'
                          : 'text-surface-400 hover:text-white hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── User ── */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-[11px] font-bold text-surface-300 flex-shrink-0 ring-1 ring-white/[0.08]">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-semibold text-surface-200 truncate">
              {staff?.name}
            </p>
            <p className="text-[11px] text-surface-500">
              {ROLE_LABELS[staff?.role ?? 'WAITER']}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-surface-500 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <LogOut size={14} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
