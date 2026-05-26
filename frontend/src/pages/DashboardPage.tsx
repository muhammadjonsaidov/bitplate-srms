import { useQuery } from '@tanstack/react-query'
import { fetchTables } from '../api/tables'
import { Table } from '../types'

export default function DashboardPage() {
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'], queryFn: fetchTables, refetchInterval: 30_000,
  })

  const counts = {
    free:     (tables as Table[]).filter(t => t.status === 'FREE').length,
    occupied: (tables as Table[]).filter(t => t.status === 'OCCUPIED').length,
    awaiting: (tables as Table[]).filter(t => t.status === 'AWAITING_BILL').length,
    reserved: (tables as Table[]).filter(t => t.status === 'RESERVED').length,
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manager Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Free', count: counts.free, color: 'green' },
          { label: 'Occupied', count: counts.occupied, color: 'orange' },
          { label: 'Awaiting Bill', count: counts.awaiting, color: 'yellow' },
          { label: 'Reserved', count: counts.reserved, color: 'blue' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
            <div className={`text-3xl font-bold text-${color}-700`}>{count}</div>
            <div className={`text-sm text-${color}-600 mt-1`}>{label} Tables</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-3">Design Patterns Active</h3>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>✅ <strong>Command</strong> — Kitchen Queue with undo</li>
          <li>✅ <strong>Singleton</strong> — Order History Log (thread-safe)</li>
          <li>✅ <strong>Strategy</strong> — Pricing Engine (Standard / Happy Hour / Loyalty)</li>
          <li>✅ <strong>Observer</strong> — Order status → Waiter/Kitchen/Manager notifications</li>
          <li>✅ <strong>State</strong> — Table lifecycle (Free→Occupied→AwaitingBill→Cleared)</li>
          <li>✅ <strong>Factory Method</strong> — Menu item creation</li>
          <li>✅ <strong>Decorator</strong> — Meal customisation (allergen, special prep)</li>
          <li>✅ <strong>Facade</strong> — Billing & POS subsystem</li>
          <li>✅ <strong>Composite</strong> — ComboMeal containing MenuItems</li>
          <li>✅ <strong>Iterator</strong> — Order history traversal</li>
        </ul>
      </div>
    </div>
  )
}
