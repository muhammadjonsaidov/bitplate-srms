import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
