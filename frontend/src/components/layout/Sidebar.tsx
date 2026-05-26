import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/tables',   label: '🪑 Tables',    roles: ['MANAGER','WAITER','CASHIER'] },
  { path: '/orders',   label: '📋 Orders',    roles: ['MANAGER','WAITER'] },
  { path: '/kitchen',  label: '👨‍🍳 Kitchen',  roles: ['MANAGER','HEAD_CHEF'] },
  { path: '/billing',  label: '💳 Billing',   roles: ['MANAGER','CASHIER'] },
  { path: '/dashboard',label: '📊 Dashboard', roles: ['MANAGER'] },
]

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

  return (
    <aside className="w-56 bg-biteplate-700 text-white flex flex-col">
      <div className="p-4 border-b border-biteplate-800">
        <h1 className="text-xl font-bold">🍽️ BitePlate</h1>
        <p className="text-xs text-biteplate-200 mt-1">SRMS</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {allowed.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive ? 'bg-biteplate-500 text-white' : 'text-biteplate-100 hover:bg-biteplate-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-biteplate-800">
        <p className="text-xs text-biteplate-100">{staff?.name}</p>
        <p className="text-xs text-biteplate-200 mb-2">{staff?.role}</p>
        <button onClick={handleLogout}
          className="w-full text-xs bg-biteplate-600 hover:bg-biteplate-500 text-white px-3 py-1.5 rounded">
          Logout
        </button>
      </div>
    </aside>
  )
}
