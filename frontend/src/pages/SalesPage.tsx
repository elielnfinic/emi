import { useQuery } from '@tanstack/react-query'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Sale } from '../types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function SalesPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const { data, isLoading } = useQuery<Sale[]>({
    queryKey: ['sales', bid],
    queryFn: async () => (await api.get('/sales', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })
  if (!bid) return <p className="text-gray-500 py-8 text-center">Select a business first</p>
  if (isLoading) return <Loader />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {data?.length ? data.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{s.reference}</td>
                <td className="px-6 py-4"><Badge variant={s.type === 'cash' ? 'success' : 'info'}>{s.type}</Badge></td>
                <td className="px-6 py-4 text-gray-500">{s.customer?.name || 'Walk-in'}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{fmt(s.totalAmount)}</td>
                <td className="px-6 py-4"><Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge></td>
                <td className="px-6 py-4 text-gray-500">{s.date}</td>
              </tr>
            )) : <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No sales found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
