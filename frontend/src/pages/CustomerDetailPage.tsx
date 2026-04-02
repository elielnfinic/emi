import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { StatCard } from '../components/ui/Card'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Customer, Sale } from '../types'

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function buildChartData(sales: Sale[]) {
  const monthly: Record<string, number> = {}
  for (const sale of sales) {
    const d = sale.date?.toString().slice(0, 7) || 'Unknown'
    monthly[d] = (monthly[d] || 0) + sale.totalAmount
  }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'

  const { data: customer, isLoading: loadingCustomer } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => (await api.get(`/customers/${id}`)).data,
    enabled: !!id,
  })

  const { data: sales, isLoading: loadingSales } = useQuery<Sale[]>({
    queryKey: ['customer-sales', id, bid],
    queryFn: async () =>
      (await api.get('/sales', { params: { business_id: bid, customer_id: id } })).data,
    enabled: !!id && !!bid,
  })

  if (loadingCustomer || loadingSales) return <Loader />
  if (!customer) return <p className="text-center py-16 text-gray-500">Customer not found.</p>

  const totalSales = sales?.reduce((sum, s) => sum + s.totalAmount, 0) || 0
  const totalPaid = sales?.reduce((sum, s) => sum + s.paidAmount, 0) || 0
  const totalDebt = totalSales - totalPaid
  const salesCount = sales?.length || 0
  const chartData = buildChartData(sales || [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="customers" size={20} />
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{customer.email || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900">{customer.phone || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Address</p>
            <p className="font-medium text-gray-900">{customer.address || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Notes</p>
            <p className="font-medium text-gray-900">{customer.notes || '-'}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={fmt(totalSales, cur)} color="green" icon={<Icon name="sales" size={22} />} />
        <StatCard title="Total Paid" value={fmt(totalPaid, cur)} color="blue" icon={<Icon name="wallet" size={22} />} />
        <StatCard title="Outstanding Debt" value={fmt(totalDebt, cur)} color={totalDebt > 0 ? 'red' : 'green'} icon={<Icon name="alert" size={22} />} />
        <StatCard title="Transactions" value={salesCount} color="violet" icon={<Icon name="bar-chart" size={22} />} />
      </div>

      {/* Sales Progress Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => [fmt(Number(value), cur), 'Sales']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="total" stroke="#7B5CF6" strokeWidth={2} dot={{ fill: '#7B5CF6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon name="sales" size={18} className="text-emi-green" />
          <h3 className="text-lg font-semibold text-gray-900">Sales History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales?.length ? sales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.reference}</td>
                  <td className="px-6 py-4 text-gray-500">{s.date?.toString().slice(0, 10)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.type === 'cash' ? 'success' : 'warning'}>{s.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{fmt(s.totalAmount, cur)}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{fmt(s.paidAmount, cur)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-green-light text-emi-green mb-2">
                      <Icon name="sales" size={24} />
                    </div>
                    <p className="text-gray-500">No sales recorded for this customer.</p>
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
