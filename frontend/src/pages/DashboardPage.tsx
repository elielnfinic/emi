import { useQuery } from '@tanstack/react-query'
import { StatCard } from '../components/ui/Card'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { DashboardData } from '../types'

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function DashboardPage() {
  const { currentBusiness } = useAppStore()
  const businessId = currentBusiness?.id

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', businessId],
    queryFn: async () => (await api.get('/dashboard', { params: { business_id: businessId } })).data,
    enabled: !!businessId,
  })

  if (!businessId) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">👋</div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to EMI</h2>
      <p className="text-gray-500">Select or create a business to get started.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const k = data?.kpis
  const cur = currentBusiness?.currency || 'USD'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{currentBusiness?.name} overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Balance" value={fmt(k?.balance || 0, cur)} color="violet" icon={<span className="text-xl">💰</span>} />
        <StatCard title="Today's Sales" value={fmt(k?.todaySalesTotal || 0, cur)} color="green" icon={<span className="text-xl">📈</span>} />
        <StatCard title="Monthly Sales" value={fmt(k?.monthSalesTotal || 0, cur)} color="blue" icon={<span className="text-xl">📊</span>} />
        <StatCard title="Low Stock Items" value={k?.lowStockCount || 0} color={k?.lowStockCount ? 'red' : 'green'} icon={<span className="text-xl">📦</span>} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Income" value={fmt(k?.totalIncome || 0, cur)} color="green" icon={<span className="text-xl">💵</span>} />
        <StatCard title="Total Expense" value={fmt(k?.totalExpense || 0, cur)} color="red" icon={<span className="text-xl">💸</span>} />
        <StatCard title="Customers" value={k?.totalCustomers || 0} color="violet" icon={<span className="text-xl">👥</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.recentTransactions?.length ? data.recentTransactions.map((tx) => (
              <div key={tx.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.reference}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.description || 'No description'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount, cur)}
                  </p>
                  <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>{tx.type}</Badge>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No transactions yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.recentSales?.length ? data.recentSales.map((s) => (
              <div key={s.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.reference}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.customer?.name || 'Walk-in'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{fmt(s.totalAmount, cur)}</p>
                  <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-400">No sales yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
