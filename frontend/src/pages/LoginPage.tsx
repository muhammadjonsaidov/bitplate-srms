import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login } from '../api/auth'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const data = await login({ username: username.trim(), password })
      setAuth(data.accessToken, data.staff)
      toast.success(`Welcome back, ${data.staff.name}!`)
      navigate('/')
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-biteplate-600 flex items-center justify-center">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">BitePlate</span>
        </div>
        <div>
          <blockquote className="text-slate-300 text-xl leading-relaxed mb-6">
            "Everything you need to run a modern restaurant — tables, orders, kitchen, and billing, all in one place."
          </blockquote>
          <div className="flex gap-8">
            {[
              { value: 'Real-time', label: 'Kitchen display' },
              { value: 'Role-based', label: 'Access control' },
              { value: 'Live', label: 'Order tracking' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-white font-bold text-sm">{value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} BitePlate. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-biteplate-600 flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">BitePlate</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in to your account</h1>
          <p className="text-sm text-slate-500 mb-8">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input"
                placeholder="your.username"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
