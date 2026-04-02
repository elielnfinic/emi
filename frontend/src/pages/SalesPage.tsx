import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Sale, Customer } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

interface SaleItemInput {
  name: string
  quantity: number
  unitPrice: number
}

export function SalesPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState('cash')
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<SaleItemInput[]>([{ name: '', quantity: 1, unitPrice: 0 }])

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
    setShowModal(false)
    setType('cash')
    setCustomerId('')
    setDate('')
    setNotes('')
    setItems([{ name: '', quantity: 1, unitPrice: 0 }])
  }

  const updateItem = (index: number, field: keyof SaleItemInput, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => setItems(prev => [...prev, { name: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid,
      type,
      customerId: customerId ? Number(customerId) : undefined,
      date: date || undefined,
      notes: notes || undefined,
      items: items.map(item => ({
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
        <Button onClick={() => setShowModal(true)}>+ New Sale</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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

      <Modal isOpen={showModal} onClose={resetForm} title="New Sale">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              options={customers?.map(c => ({ value: String(c.id), label: c.name })) || []}
              placeholder="Walk-in customer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>+ Add Item</Button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={String(item.quantity)}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      min={1}
                      required
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={String(item.unitPrice)}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>✕</Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Sale</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
