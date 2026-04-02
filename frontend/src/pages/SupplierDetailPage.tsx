import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { StatCard } from '../components/ui/Card'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Supplier, Transaction } from '../types'

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function buildChartData(transactions: Transaction[]) {
  const monthly: Record<string, number> = {}
  for (const tx of transactions) {
    const d = tx.date?.toString().slice(0, 7) || 'Unknown'
    monthly[d] = (monthly[d] || 0) + tx.amount
  }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'

  const { data: supplier, isLoading: loadingSupplier } = useQuery<Supplier>({
    queryKey: ['supplier', id],
    queryFn: async () => (await api.get(`/suppliers/${id}`)).data,
    enabled: !!id,
  })

  const { data: transactions, isLoading: loadingTx } = useQuery<Transaction[]>({
    queryKey: ['supplier-transactions', id, bid, supplier?.name],
    queryFn: async () =>
      (await api.get('/transactions', {
        params: { business_id: bid, type: 'expense', beneficiary: supplier?.name },
      })).data,
    enabled: !!id && !!bid && !!supplier?.name,
  })

  if (loadingSupplier || loadingTx) return <Loader />
  if (!supplier) return <p className="text-center py-16 text-gray-500">Supplier not found.</p>

  const totalExpenses = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0
  const txCount = transactions?.length || 0
  const chartData = buildChartData(transactions || [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/suppliers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="suppliers" size={20} />
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
      </div>

      {/* Supplier Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{supplier.email || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{supplier.phone || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Address</p>
            <p className="font-medium text-gray-900">{supplier.address || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Notes</p>
            <p className="font-medium text-gray-900">{supplier.notes || '-'}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Expenses" value={fmt(totalExpenses, cur)} color="red" icon={<Icon name="arrow-down" size={22} />} />
        <StatCard title="Transactions" value={txCount} color="violet" icon={<Icon name="bar-chart" size={22} />} />
        <StatCard title="Avg per Transaction" value={fmt(txCount > 0 ? totalExpenses / txCount : 0, cur)} color="blue" icon={<Icon name="trending-up" size={22} />} />
      </div>

      {/* Expenses Evolution Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses Evolution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => [fmt(Number(value), cur), 'Expenses']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon name="arrow-up-down" size={18} className="text-emi-violet" />
          <h3 className="text-lg font-semibold text-gray-900">Expense Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions?.length ? transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.reference}</td>
                  <td className="px-6 py-4 text-gray-500">{tx.date?.toString().slice(0, 10)}</td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{tx.category?.name || '-'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{tx.description || '-'}</td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">{fmt(tx.amount, cur)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                      <Icon name="suppliers" size={24} />
                    </div>
                    <p className="text-gray-500">No expense transactions recorded for this supplier.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
