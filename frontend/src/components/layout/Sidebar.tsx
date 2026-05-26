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
  LogOut,
  UtensilsCrossed,
} from 'lucide-react'

const navItems = [
  { path: '/tables',    label: 'Tables',    icon: LayoutGrid,    roles: ['MANAGER','WAITER','CASHIER'] },
  { path: '/orders',    label: 'Orders',    icon: ClipboardList, roles: ['MANAGER','WAITER'] },
  { path: '/kitchen',   label: 'Kitchen',   icon: ChefHat,       roles: ['MANAGER','HEAD_CHEF'] },
  { path: '/billing',   label: 'Billing',   icon: CreditCard,    roles: ['MANAGER','CASHIER'] },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3,     roles: ['MANAGER'] },
]

const roleLabels: Record<string, string> = {
  MANAGER:   'Manager',
  HEAD_CHEF: 'Head Chef',
  WAITER:    'Waiter',
  CASHIER:   'Cashier',
}

export default function Sidebar() {
  const { staff, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/login')
    toast.success('Logged out')
  }

  const allowed = navItems.filter(item => staff && item.roles.includes(staff.role))

  const initials = staff?.name
    ? staff.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-biteplate-600 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">BitePlate</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Restaurant POS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {allowed.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-biteplate-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{staff?.name}</p>
            <p className="text-xs text-slate-500">{roleLabels[staff?.role ?? ''] ?? staff?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
