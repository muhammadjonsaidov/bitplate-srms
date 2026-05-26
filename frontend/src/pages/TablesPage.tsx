import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, seatCustomer, clearTable } from '../api/tables'
import { Table, TableStatus } from '../types'
import toast from 'react-hot-toast'

const statusColors: Record<TableStatus, string> = {
  FREE:          'bg-green-100 border-green-400 text-green-800',
  RESERVED:      'bg-blue-100 border-blue-400 text-blue-800',
  OCCUPIED:      'bg-orange-100 border-orange-400 text-orange-800',
  AWAITING_BILL: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  CLEARED:       'bg-gray-100 border-gray-400 text-gray-600',
}

export default function TablesPage() {
  const qc = useQueryClient()
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'], queryFn: fetchTables, refetchInterval: 15_000,
  })
  const seat = useMutation({
    mutationFn: seatCustomer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Customer seated') },
    onError: () => toast.error('Cannot seat customer at this table'),
  })
  const clear = useMutation({
    mutationFn: clearTable,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Table cleared') },
    onError: () => toast.error('Cannot clear table'),
  })

  if (isLoading) return <div className="p-8 text-gray-500">Loading tables…</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Table Management</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(tables as Table[]).map(table => (
          <div key={table.id} className={`border-2 rounded-xl p-4 ${statusColors[table.status]}`}>
            <div className="text-lg font-bold">Table {table.tableNumber}</div>
            <div className="text-xs mb-1">Cap: {table.capacity}</div>
            <div className="text-xs font-medium mb-3">{table.status.replace('_', ' ')}</div>
            {table.status === 'FREE' && (
              <button onClick={() => seat.mutate(table.id)}
                className="w-full text-xs bg-green-600 text-white py-1 rounded hover:bg-green-700">
                Seat Customer
              </button>
            )}
            {(table.status === 'AWAITING_BILL' || table.status === 'CLEARED') && (
              <button onClick={() => clear.mutate(table.id)}
                className="w-full text-xs bg-gray-600 text-white py-1 rounded hover:bg-gray-700">
                Clear Table
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
