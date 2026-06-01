import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login } from '../api/auth'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const data = await login({ username: username.trim(), password })
      setAuth(data.accessToken, data.staff)
      toast.success(`Welcome back, ${data.staff.name}`)
      navigate('/')
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left — branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-brand-500/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <UtensilsCrossed size={19} className="text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-white">BitePlate</span>
          </div>

          <h2 className="font-display text-4xl font-semibold text-white leading-tight mb-4">
            Smart Restaurant<br />Management
          </h2>
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">
            Tables, orders, kitchen, and billing — everything your restaurant
            needs in a single, elegant system.
          </p>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { value: 'Real-time', label: 'Kitchen display' },
              { value: 'Role-based', label: 'Access control' },
              { value: 'Live', label: 'Order tracking' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-brand-400 font-bold text-xs uppercase tracking-wider">{value}</div>
                <div className="text-surface-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-surface-600 text-xs">
            &copy; {new Date().getFullYear()} BitePlate SRMS &middot; Unit 27 Advanced Programming
          </p>
        </div>
      </div>

      {/* ── Right — login form ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-[360px] animate-fade-in">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <UtensilsCrossed size={17} className="text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-surface-900">BitePlate</span>
          </div>

          <h1 className="text-2xl font-bold text-surface-900 tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-surface-500 mb-8">
            Sign in to access your restaurant dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-11"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm"
            >
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
