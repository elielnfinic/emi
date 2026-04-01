import { useQuery } from '@tanstack/react-query'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Transaction } from '../types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function TransactionsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const { data, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', bid],
    queryFn: async () => (await api.get('/transactions', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })
  if (!bid) return <p className="text-gray-500 py-8 text-center">Select a business first</p>
  if (isLoading) return <Loader />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {data?.length ? data.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{tx.reference}</td>
                <td className="px-6 py-4"><Badge variant={tx.type === 'income' ? 'success' : 'danger'}>{tx.type}</Badge></td>
                <td className={`px-6 py-4 font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{fmt(tx.amount)}</td>
                <td className="px-6 py-4 text-gray-500">{tx.description || '-'}</td>
                <td className="px-6 py-4 text-gray-500">{tx.date}</td>
              </tr>
            )) : <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
