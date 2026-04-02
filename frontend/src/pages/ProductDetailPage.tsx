import { useState, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { StatCard } from '../components/ui/Card'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { StockItem, StockTransaction, Sale, Rotation, Supplier, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

function buildStockChartData(transactions: StockTransaction[]) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  const monthly: Record<string, { in: number; out: number }> = {}
  for (const tx of sorted) {
    const month = tx.date?.toString().slice(0, 7) || 'Unknown'
    if (!monthly[month]) monthly[month] = { in: 0, out: 0 }
    if (tx.type === 'in') monthly[month].in += tx.quantity
    else if (tx.type === 'out') monthly[month].out += tx.quantity
  }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, stockIn: data.in, stockOut: data.out }))
}

function buildSalesChartData(sales: Sale[]) {
  const monthly: Record<string, number> = {}
  for (const sale of sales) {
    const d = sale.date?.toString().slice(0, 7) || 'Unknown'
    monthly[d] = (monthly[d] || 0) + sale.totalAmount
  }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  // Stock-In modal
  const [showStockIn, setShowStockIn] = useState(false)
  const [siQuantity, setSiQuantity] = useState('')
  const [siUnitPrice, setSiUnitPrice] = useState('')
  const [siSupplierId, setSiSupplierId] = useState('')
  const [siRotationId, setSiRotationId] = useState('')
  const [siNotes, setSiNotes] = useState('')
  const [siDate, setSiDate] = useState(new Date().toISOString().split('T')[0])

  // Edit transaction modal
  const [editTx, setEditTx] = useState<StockTransaction | null>(null)
  const [editTxQuantity, setEditTxQuantity] = useState('')
  const [editTxUnitPrice, setEditTxUnitPrice] = useState('')
  const [editTxRotationId, setEditTxRotationId] = useState('')
  const [editTxNotes, setEditTxNotes] = useState('')
  const [editTxDate, setEditTxDate] = useState('')

  // Bulk rotation move
  const [selectedTxIds, setSelectedTxIds] = useState<Set<number>>(new Set())
  const [showBulkMove, setShowBulkMove] = useState(false)
  const [bulkRotationId, setBulkRotationId] = useState('')

  // Transactions pagination
  const [txPage, setTxPage] = useState(1)

  // Queries
  const { data: product, isLoading: loadingProduct } = useQuery<StockItem>({
    queryKey: ['stock-item', id],
    queryFn: async () => (await api.get(`/stock-items/${id}`)).data,
    enabled: !!id,
  })

  const { data: txData, isLoading: loadingTx } = useQuery<PaginatedResponse<StockTransaction>>({
    queryKey: ['stock-transactions', bid, id, txPage],
    queryFn: async () => (await api.get('/stock-transactions', { params: { business_id: bid, stock_item_id: id, page: txPage } })).data,
    enabled: !!id && !!bid,
  })

  const { data: allSales } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['product-sales', bid, id],
    queryFn: async () => (await api.get('/sales', { params: { business_id: bid, per_page: 100 } })).data,
    enabled: !!bid,
  })

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliers-list', bid],
    queryFn: async () => {
      const res = await api.get('/suppliers', { params: { business_id: bid, per_page: 500 } })
      return res.data.data || res.data
    },
    enabled: !!bid,
  })

  const { data: rotations } = useQuery<Rotation[]>({
    queryKey: ['rotations-list', bid],
    queryFn: async () => (await api.get('/rotations', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  // Mutations
  const stockInMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/stock-transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-item', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      setShowStockIn(false)
      resetStockInForm()
    },
  })

  const updateTxMutation = useMutation({
    mutationFn: ({ txId, ...payload }: Record<string, unknown>) => api.put(`/stock-transactions/${txId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-item', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      setEditTx(null)
    },
  })

  const deleteTxMutation = useMutation({
    mutationFn: (txId: number) => api.delete(`/stock-transactions/${txId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-item', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
    },
  })

  const bulkMoveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/stock-transactions/bulk-move-rotation', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      setShowBulkMove(false)
      setSelectedTxIds(new Set())
      setBulkRotationId('')
    },
  })

  const resetStockInForm = () => {
    setSiQuantity(''); setSiUnitPrice(''); setSiSupplierId('')
    setSiRotationId(''); setSiNotes(''); setSiDate(new Date().toISOString().split('T')[0])
  }

  const openEditTx = (tx: StockTransaction) => {
    setEditTx(tx)
    setEditTxQuantity(String(tx.quantity))
    setEditTxUnitPrice(tx.unitPrice != null ? String(tx.unitPrice) : '')
    setEditTxRotationId(tx.rotationId != null ? String(tx.rotationId) : '')
    setEditTxNotes(tx.notes || '')
    setEditTxDate(tx.date?.toString().slice(0, 10) || '')
  }

  const handleStockIn = (e: FormEvent) => {
    e.preventDefault()
    stockInMutation.mutate({
      businessId: bid,
      stockItemId: Number(id),
      type: 'in',
      quantity: Number(siQuantity),
      unitPrice: siUnitPrice ? Number(siUnitPrice) : undefined,
      supplierId: siSupplierId ? Number(siSupplierId) : undefined,
      rotationId: siRotationId ? Number(siRotationId) : undefined,
      notes: siNotes || undefined,
      date: siDate || undefined,
    })
  }

  const handleUpdateTx = (e: FormEvent) => {
    e.preventDefault()
    if (!editTx) return
    updateTxMutation.mutate({
      txId: editTx.id,
      quantity: Number(editTxQuantity),
      unitPrice: editTxUnitPrice ? Number(editTxUnitPrice) : null,
      rotationId: editTxRotationId ? Number(editTxRotationId) : null,
      notes: editTxNotes || null,
      date: editTxDate || undefined,
    })
  }

  const handleDeleteTx = (txId: number) => {
    if (window.confirm('Delete this stock transaction? This will reverse the stock quantity.')) {
      deleteTxMutation.mutate(txId)
    }
  }

  const handleBulkMove = (e: FormEvent) => {
    e.preventDefault()
    bulkMoveMutation.mutate({
      transactionIds: Array.from(selectedTxIds),
      rotationId: bulkRotationId ? Number(bulkRotationId) : null,
    })
  }

  const toggleTxSelection = (txId: number) => {
    setSelectedTxIds(prev => {
      const next = new Set(prev)
      if (next.has(txId)) next.delete(txId)
      else next.add(txId)
      return next
    })
  }

  const toggleSelectAll = () => {
    const txs = txData?.data ?? []
    if (selectedTxIds.size === txs.length) {
      setSelectedTxIds(new Set())
    } else {
      setSelectedTxIds(new Set(txs.map(t => t.id)))
    }
  }

  if (loadingProduct || loadingTx) return <Loader />
  if (!product) return <p className="text-center py-16 text-gray-500">Product not found.</p>

  const transactions = txData?.data ?? []
  const txMeta = txData?.meta

  // Filter sales that contain this product
  const productSales = (allSales?.data ?? []).filter(s =>
    s.items?.some(item => item.stockItemId === product.id)
  )

  // Compute stats
  const totalIn = transactions.filter(t => t.type === 'in').reduce((s, t) => s + t.quantity, 0)
  const totalOut = transactions.filter(t => t.type === 'out').reduce((s, t) => s + t.quantity, 0)
  const totalSalesAmount = productSales.reduce((s, sale) => {
    const relevantItems = sale.items?.filter(i => i.stockItemId === product.id) || []
    return s + relevantItems.reduce((sum, i) => sum + i.totalPrice, 0)
  }, 0)

  // All transactions from the item (via preload)
  const allTxForCharts = product.movements || transactions
  const stockChartData = buildStockChartData(allTxForCharts)
  const salesChartData = buildSalesChartData(productSales)

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/stock" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="stock" size={20} />
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.sku && <Badge variant="info">{product.sku}</Badge>}
        </div>
        <Button onClick={() => { resetStockInForm(); setSiUnitPrice(product.purchasePrice != null ? String(product.purchasePrice) : ''); setShowStockIn(true) }}>
          <Icon name="plus" size={16} className="mr-1" /> Stock-In
        </Button>
      </div>

      {/* Product Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Unit</p>
            <p className="font-medium text-gray-900">{product.unit}</p>
          </div>
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-medium text-gray-900">{product.category || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Purchase Price</p>
            <p className="font-medium text-gray-900">{product.purchasePrice != null ? fmt(product.purchasePrice, cur) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Selling Price</p>
            <p className="font-medium text-gray-900">{product.sellingPrice != null ? fmt(product.sellingPrice, cur) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Min Alert Qty</p>
            <p className="font-medium text-gray-900">{product.minQuantity}</p>
          </div>
          <div>
            <p className="text-gray-500">Description</p>
            <p className="font-medium text-gray-900">{product.description || '-'}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Stock"
          value={`${product.quantity} ${product.unit}`}
          color={product.quantity <= product.minQuantity ? 'red' : 'green'}
          icon={<Icon name="package" size={22} />}
        />
        <StatCard title="Total Stock-In" value={totalIn} color="blue" icon={<Icon name="arrow-down" size={22} />} />
        <StatCard title="Total Stock-Out" value={totalOut} color="yellow" icon={<Icon name="arrow-up" size={22} />} />
        <StatCard title="Sales Revenue" value={fmt(totalSalesAmount, cur)} color="violet" icon={<Icon name="sales" size={22} />} />
      </div>

      {/* Stock Movement Chart */}
      {stockChartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Movements Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="stockIn" fill="#00C853" name="Stock In" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stockOut" fill="#ef4444" name="Stock Out" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sales Chart */}
      {salesChartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => [fmt(Number(value), cur), 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="total" stroke="#7B5CF6" strokeWidth={2} dot={{ fill: '#7B5CF6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stock Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="arrow-up-down" size={18} className="text-emi-violet" />
            <h3 className="text-lg font-semibold text-gray-900">Stock Transaction History</h3>
          </div>
          {selectedTxIds.size > 0 && (
            <Button size="sm" variant="secondary" onClick={() => setShowBulkMove(true)}>
              Move {selectedTxIds.size} to Rotation
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={transactions.length > 0 && selectedTxIds.size === transactions.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rotation</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length ? transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTxIds.has(tx.id)}
                      onChange={() => toggleTxSelection(tx.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4 text-gray-500">{tx.date?.toString().slice(0, 10)}</td>
                  <td className="px-4 py-4">
                    <Badge variant={tx.type === 'in' ? 'success' : tx.type === 'out' ? 'danger' : 'warning'}>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">{tx.quantity}</td>
                  <td className="px-4 py-4 text-gray-500">{tx.unitPrice != null ? fmt(tx.unitPrice, cur) : '-'}</td>
                  <td className="px-4 py-4 text-gray-500">{tx.reason || '-'}</td>
                  <td className="px-4 py-4 text-gray-500 max-w-[200px] truncate">{tx.notes || '-'}</td>
                  <td className="px-4 py-4 text-gray-500">
                    {tx.rotationId ? (
                      <Badge variant="info">{rotations?.find(r => r.id === tx.rotationId)?.name || `#${tx.rotationId}`}</Badge>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditTx(tx)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Edit"
                      >
                        <Icon name="settings" size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                      <Icon name="arrow-up-down" size={24} />
                    </div>
                    <p className="text-gray-500">No stock transactions yet. Use Stock-In to add inventory.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {txMeta && <Pagination meta={txMeta} onPageChange={setTxPage} />}
      </div>

      {/* Product Sales History */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productSales.length ? productSales.map((sale) => {
                const saleItems = sale.items?.filter(i => i.stockItemId === product.id) || []
                const qty = saleItems.reduce((s, i) => s + i.quantity, 0)
                const revenue = saleItems.reduce((s, i) => s + i.totalPrice, 0)
                return (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{sale.reference}</td>
                    <td className="px-6 py-4 text-gray-500">{sale.date?.toString().slice(0, 10)}</td>
                    <td className="px-6 py-4 text-gray-500">{sale.customer?.name || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{qty}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{fmt(revenue, cur)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={sale.status === 'completed' ? 'success' : 'warning'}>{sale.status}</Badge>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-green-light text-emi-green mb-2">
                      <Icon name="sales" size={24} />
                    </div>
                    <p className="text-gray-500">No sales recorded for this product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock-In Modal */}
      <Modal isOpen={showStockIn} onClose={() => setShowStockIn(false)} title="Stock-In">
        <form onSubmit={handleStockIn} className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Product:</span>{' '}
            <span className="font-medium text-gray-900">{product.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" step="0.01" value={siQuantity} onChange={(e) => setSiQuantity(e.target.value)} required placeholder="0" />
            <Input label="Unit Price" type="number" step="0.01" value={siUnitPrice} onChange={(e) => setSiUnitPrice(e.target.value)} placeholder="0.00" />
          </div>
          <Input label="Date" type="date" value={siDate} onChange={(e) => setSiDate(e.target.value)} />
          {suppliers && suppliers.length > 0 && (
            <Select
              label="Supplier (optional)"
              options={suppliers.map(s => ({ value: String(s.id), label: s.name }))}
              placeholder="No supplier"
              value={siSupplierId}
              onChange={(e) => setSiSupplierId(e.target.value)}
            />
          )}
          {rotations && rotations.filter(r => r.status === 'active').length > 0 && (
            <Select
              label="Rotation (optional)"
              options={rotations.filter(r => r.status === 'active').map(r => ({ value: String(r.id), label: r.name }))}
              placeholder="No rotation"
              value={siRotationId}
              onChange={(e) => setSiRotationId(e.target.value)}
            />
          )}
          <Input label="Notes" value={siNotes} onChange={(e) => setSiNotes(e.target.value)} placeholder="e.g. Received batch from Supplier X" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowStockIn(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={stockInMutation.isPending}>Add Stock</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal isOpen={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaction">
        <form onSubmit={handleUpdateTx} className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Type:</span>{' '}
            <Badge variant={editTx?.type === 'in' ? 'success' : editTx?.type === 'out' ? 'danger' : 'warning'}>
              {editTx?.type?.toUpperCase() || ''}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" step="0.01" value={editTxQuantity} onChange={(e) => setEditTxQuantity(e.target.value)} required />
            <Input label="Unit Price" type="number" step="0.01" value={editTxUnitPrice} onChange={(e) => setEditTxUnitPrice(e.target.value)} placeholder="0.00" />
          </div>
          <Input label="Date" type="date" value={editTxDate} onChange={(e) => setEditTxDate(e.target.value)} />
          {rotations && rotations.length > 0 && (
            <Select
              label="Rotation"
              options={rotations.map(r => ({ value: String(r.id), label: r.name }))}
              placeholder="No rotation"
              value={editTxRotationId}
              onChange={(e) => setEditTxRotationId(e.target.value)}
            />
          )}
          <Input label="Notes" value={editTxNotes} onChange={(e) => setEditTxNotes(e.target.value)} placeholder="Notes" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditTx(null)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={updateTxMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Move Rotation Modal */}
      <Modal isOpen={showBulkMove} onClose={() => setShowBulkMove(false)} title="Move Transactions to Rotation">
        <form onSubmit={handleBulkMove} className="space-y-3">
          <p className="text-sm text-gray-500">
            Move <span className="font-medium text-gray-900">{selectedTxIds.size}</span> transaction{selectedTxIds.size > 1 ? 's' : ''} to a rotation.
          </p>
          {rotations && (
            <Select
              label="Target Rotation"
              options={rotations.map(r => ({ value: String(r.id), label: `${r.name} (${r.status})` }))}
              placeholder="Remove from rotation"
              value={bulkRotationId}
              onChange={(e) => setBulkRotationId(e.target.value)}
            />
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowBulkMove(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={bulkMoveMutation.isPending}>Move Transactions</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
