import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Icon } from '../components/ui/Icon'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Sale, Transaction, StockItem } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

type Tab = 'sales' | 'transactions' | 'stock'

export function ReportsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'

  const [tab, setTab] = useState<Tab>('sales')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: salesData, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['report-sales', bid, from, to],
    queryFn: async () => {
      const params: Record<string, unknown> = { business_id: bid }
      if (from) params.from = from
      if (to) params.to = to
      return (await api.get('/sales', { params })).data
    },
    enabled: !!bid && tab === 'sales',
  })

  const { data: txData, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['report-transactions', bid, from, to],
    queryFn: async () => {
      const params: Record<string, unknown> = { business_id: bid }
      if (from) params.from = from
      if (to) params.to = to
      return (await api.get('/transactions', { params })).data
    },
    enabled: !!bid && tab === 'transactions',
  })

  const { data: stockData, isLoading: stockLoading } = useQuery<StockItem[]>({
    queryKey: ['report-stock', bid],
    queryFn: async () => (await api.get('/stock-items', { params: { business_id: bid } })).data,
    enabled: !!bid && tab === 'stock',
  })

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emi-violet-light text-emi-violet mb-4">
        <Icon name="reports" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to view reports.</p>
    </div>
  )

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sales', label: 'Sales Report' },
    { key: 'transactions', label: 'Transactions Report' },
    { key: 'stock', label: 'Stock Report' },
  ]

  const totalSales = salesData?.reduce((sum, s) => sum + s.totalAmount, 0) || 0
  const totalIncome = txData?.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
  const totalExpense = txData?.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0
  const totalStockValue = stockData?.reduce((sum, s) => sum + s.quantity * (s.sellingPrice || 0), 0) || 0
  const lowStockItems = stockData?.filter((s) => s.quantity <= s.minQuantity).length || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {(tab === 'sales' || tab === 'transactions') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button variant="secondary" onClick={() => { setFrom(''); setTo('') }}>Clear Dates</Button>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalSales, cur)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Number of Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{salesData?.length || 0}</p>
            </div>
          </div>
          {salesLoading ? <Loader /> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesData?.length ? salesData.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{s.reference}</td>
                        <td className="px-6 py-4 text-gray-500">{s.customer?.name || 'Walk-in'}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{fmt(s.totalAmount, cur)}</td>
                        <td className="px-6 py-4 text-gray-500">{s.status}</td>
                        <td className="px-6 py-4 text-gray-500">{s.date}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No sales data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'transactions' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-emi-green mt-1">{fmt(totalIncome, cur)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Expense</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{fmt(totalExpense, cur)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Net</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalIncome - totalExpense, cur)}</p>
            </div>
          </div>
          {txLoading ? <Loader /> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {txData?.length ? txData.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{tx.reference}</td>
                        <td className="px-6 py-4 text-gray-500 capitalize">{tx.type}</td>
                        <td className={`px-6 py-4 font-medium ${tx.type === 'income' ? 'text-emi-green' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount, cur)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{tx.description || '-'}</td>
                        <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No transactions data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'stock' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stockData?.length || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(totalStockValue, cur)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems}</p>
            </div>
          </div>
          {stockLoading ? <Loader /> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stockData?.length ? stockData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500">{item.sku || '-'}</td>
                        <td className={`px-6 py-4 font-medium ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</td>
                        <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                        <td className="px-6 py-4 text-gray-900">{item.sellingPrice != null ? fmt(item.sellingPrice, cur) : '-'}</td>
                        <td className="px-6 py-4 text-gray-900">{fmt(item.quantity * (item.sellingPrice || 0), cur)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No stock data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
