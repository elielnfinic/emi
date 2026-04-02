import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Sale, Customer, StockItem } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

interface SaleItemInput {
  stockItemId: number | null
  name: string
  quantity: number
  unitPrice: number
}

export function SalesPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [type, setType] = useState('cash')
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<SaleItemInput[]>([])
  const [selectedStockItemId, setSelectedStockItemId] = useState('')

  const { data, isLoading } = useQuery<Sale[]>({
    queryKey: ['sales', bid],
    queryFn: async () => (await api.get('/sales', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers', bid],
    queryFn: async () => (await api.get('/customers', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const { data: stockItems } = useQuery<StockItem[]>({
    queryKey: ['stock-items', bid],
    queryFn: async () => (await api.get('/stock-items', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/sales', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      queryClient.invalidateQueries({ queryKey: ['stock-items', bid] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
    },
  })

  const resetForm = () => {
    setType('cash')
    setCustomerId('')
    setDate('')
    setNotes('')
    setItems([])
    setSelectedStockItemId('')
  }

  const handleAddItem = () => {
    if (!selectedStockItemId) return
    const stockItem = stockItems?.find((s) => s.id === Number(selectedStockItemId))
    if (!stockItem) return
    setItems((prev) => [
      ...prev,
      {
        stockItemId: stockItem.id,
        name: stockItem.name,
        quantity: 1,
        unitPrice: stockItem.sellingPrice || 0,
      },
    ])
    setSelectedStockItemId('')
  }

  const updateItem = (index: number, field: keyof SaleItemInput, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))

  const runningTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    createMutation.mutate({
      businessId: bid,
      type,
      customerId: customerId ? Number(customerId) : undefined,
      date: date || undefined,
      notes: notes || undefined,
      items: items.map((item) => ({
        stockItemId: item.stockItemId,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this sale?')) deleteMutation.mutate(id)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🛒</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to view sales.</p>
    </div>
  )
  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Sale</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'credit', label: 'Credit' },
                ]}
              />
              <Select
                label="Customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                options={customers?.map((c) => ({ value: String(c.id), label: c.name })) || []}
                placeholder="Walk-in customer"
              />
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Product</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={selectedStockItemId}
                      onChange={(e) => setSelectedStockItemId(e.target.value)}
                      options={
                        stockItems
                          ?.filter((s) => s.quantity > 0)
                          .map((s) => ({
                            value: String(s.id),
                            label: `${s.name} (${s.quantity} ${s.unit}) — ${fmt(s.sellingPrice || 0, cur)}`,
                          })) || []
                      }
                      placeholder="Select product..."
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={handleAddItem} disabled={!selectedStockItemId}>+</Button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>✕</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={String(item.quantity)}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          min={1}
                          required
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={String(item.unitPrice)}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right">Subtotal: {fmt(item.quantity * item.unitPrice, cur)}</p>
                    </div>
                  ))}
                  <div className="bg-violet-50 rounded-lg p-3 text-right">
                    <span className="text-sm font-semibold text-violet-700">Total: {fmt(runningTotal, cur)}</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" loading={createMutation.isPending} disabled={items.length === 0}>
                Create Sale
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.length ? data.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.reference}</td>
                      <td className="px-6 py-4"><Badge variant={s.type === 'cash' ? 'success' : 'info'}>{s.type}</Badge></td>
                      <td className="px-6 py-4 text-gray-500">{s.customer?.name || 'Walk-in'}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{fmt(s.totalAmount, cur)}</td>
                      <td className="px-6 py-4"><Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge></td>
                      <td className="px-6 py-4 text-gray-500">{s.date}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-4xl mb-2">🛒</div>
                        <p className="text-gray-500">No sales yet. Add your first sale.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
