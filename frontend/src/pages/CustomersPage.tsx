import { useQuery } from '@tanstack/react-query'
import { Loader } from '../components/ui/Loader'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Customer } from '../types'

export function CustomersPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const { data, isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', bid],
    queryFn: async () => (await api.get('/customers', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })
  if (!bid) return <p className="text-gray-500 py-8 text-center">Select a business first</p>
  if (isLoading) return <Loader />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {data?.length ? data.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-gray-500">{c.email || '-'}</td>
                <td className="px-6 py-4 text-gray-500">{c.phone || '-'}</td>
              </tr>
            )) : <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No customers</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
