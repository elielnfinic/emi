import { useState, Fragment, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Sale, Customer, StockItem, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

interface SaleItemInput {
  stockItemId: number
  name: string
  quantity: number
  unitPrice: number
}

export function SalesPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const today = new Date().toISOString().split('T')[0]

  const [type, setType] = useState('cash')
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [items, setItems] = useState<SaleItemInput[]>([])
  const [selectedStockItemId, setSelectedStockItemId] = useState('')

  // Quick-add customer
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')

  // Payment panel
  const [paymentPanelId, setPaymentPanelId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payDate, setPayDate] = useState('')
  const [payNotes, setPayNotes] = useState('')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', bid, search, page],
    queryFn: async () => (await api.get('/sales', { params: { business_id: bid, search, page } })).data,
    enabled: !!bid,
  })

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers', bid],
    queryFn: async () => {
      const res = await api.get('/customers', { params: { business_id: bid, per_page: 500 } })
      return res.data.data
    },
    enabled: !!bid,
  })

  const { data: stockItems } = useQuery<StockItem[]>({
    queryKey: ['stock-items', bid],
    queryFn: async () => {
      const res = await api.get('/stock-items', { params: { business_id: bid, per_page: 500 } })
      return res.data.data
    },
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/sales', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', bid], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      queryClient.invalidateQueries({ queryKey: ['stock-items', bid] })
      resetForm()
      setFormSuccess(true)
      setTimeout(() => setFormSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } }
      setFormError(
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.message ||
        'Failed to create sale. Please try again.'
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
    },
  })

  const createCustomerMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/customers', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers', bid] })
      const newId = res.data?.id ?? res.data?.data?.id
      if (newId) setCustomerId(String(newId))
      setShowNewCustomer(false)
      setNewCustomerName('')
      setNewCustomerPhone('')
      setNewCustomerEmail('')
    },
  })

  const addPaymentMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/sales/payments', payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['sales', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      setPayAmount('')
      setPayNotes('')
    },
  })

  const openPaymentPanel = (sale: Sale) => {
    const remaining = sale.totalAmount - sale.paidAmount
    setPaymentPanelId(sale.id)
    setPayAmount(remaining > 0 ? String(Number(remaining.toFixed(2))) : '')
    setPayMethod('cash')
    setPayDate(new Date().toISOString().split('T')[0])
    setPayNotes('')
  }

  const resetForm = () => {
    setType('cash')
    setCustomerId('')
    setDate(today)
    setNotes('')
    setFormError('')
    setItems([])
    setSelectedStockItemId('')
    setShowNewCustomer(false)
    setNewCustomerName('')
    setNewCustomerPhone('')
    setNewCustomerEmail('')
  }

  const handleSelectProduct = (stockItemId: string) => {
    if (!stockItemId) return
    const stockItem = stockItems?.find((s) => s.id === Number(stockItemId))
    if (!stockItem) return
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.stockItemId === stockItem.id)
      if (existingIndex >= 0) {
        return prev.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { stockItemId: stockItem.id, name: stockItem.name, quantity: 1, unitPrice: stockItem.sellingPrice || 0 }]
    })
    setSelectedStockItemId('')
  }

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim()) return
    createCustomerMutation.mutate({
      businessId: bid,
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || undefined,
      email: newCustomerEmail.trim() || undefined,
    })
  }

  const updateItem = (index: number, field: keyof SaleItemInput, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))

  const runningTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)
    if (items.length === 0) return
    if (type === 'credit' && (!customerId || customerId === '0')) return
    createMutation.mutate({
      businessId: bid,
      type,
      customerId: customerId && customerId !== '0' ? Number(customerId) : undefined,
      date: date || today,
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

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emi-green-light text-emi-green mb-4">
        <Icon name="sales" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to view sales.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const sales = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Sale</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select
                label="Type"
                value={type}
                onChange={(e) => {
                  const next = e.target.value
                  setType(next)
                  if (next === 'credit' && (!customerId || customerId === '0')) setCustomerId('')
                }}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'credit', label: 'Credit' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer {type === 'credit' && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      options={[
                        ...(type === 'cash' ? [{ value: '0', label: 'Walk-in customer' }] : []),
                        ...(customers?.map((c) => ({ value: String(c.id), label: c.name })) || []),
                      ]}
                      placeholder="Select customer..."
                      required={type === 'credit'}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowNewCustomer((v) => !v)}
                    title="Add new customer"
                  >
                    <Icon name="plus" size={16} />
                  </Button>
                </div>
                {showNewCustomer && (
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Customer</p>
                    <Input
                      placeholder="Name *"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                    />
                    <Input
                      placeholder="Phone (optional)"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Email (optional)"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        loading={createCustomerMutation.isPending}
                        disabled={!newCustomerName.trim()}
                        onClick={handleCreateCustomer}
                      >
                        Add
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowNewCustomer(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Product</label>
                <Select
                  value={selectedStockItemId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  options={
                    stockItems
                      ?.filter((s) => s.quantity > 0)
                      .map((s) => ({
                        value: String(s.id),
                        label: `${s.name} — ${fmt(s.sellingPrice || 0, cur)} (${s.quantity} in stock)`,
                      })) || []
                  }
                  placeholder="Select to add..."
                />
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
                  <div className="bg-emi-violet-light rounded-lg p-3 text-right">
                    <span className="text-sm font-semibold text-emi-violet">Total: {fmt(runningTotal, cur)}</span>
                  </div>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">Sale created successfully!</div>
              )}
              <Button type="submit" className="w-full" loading={createMutation.isPending} disabled={items.length === 0 || (type === 'credit' && (!customerId || customerId === '0'))}>
                Create Sale
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search by reference or customer name…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
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
                  {sales.length ? sales.map((s) => {
                    const actualPaid = s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? Number(s.paidAmount)
                    const remaining = Number(s.totalAmount) - actualPaid
                    const isPending = s.type === 'credit' && s.status !== 'completed'
                    const paidPct = s.totalAmount > 0 ? Math.min(100, Math.round((actualPaid / Number(s.totalAmount)) * 100)) : 0
                    const isOpen = paymentPanelId === s.id
                    return (
                      <Fragment key={s.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{s.reference}</td>
                          <td className="px-6 py-4"><Badge variant={s.type === 'cash' ? 'success' : 'info'}>{s.type}</Badge></td>
                          <td className="px-6 py-4 text-gray-500">{s.customer?.name || 'Walk-in'}</td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{fmt(s.totalAmount, cur)}</span>
                            {isPending && (
                              <p className="text-xs text-red-500 mt-0.5">{fmt(remaining, cur)} remaining</p>
                            )}
                          </td>
                          <td className="px-6 py-4"><Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge></td>
                          <td className="px-6 py-4 text-gray-500">{s.date}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPending && (
                                <Button
                                  size="sm"
                                  variant={isOpen ? 'secondary' : 'primary'}
                                  onClick={() => isOpen ? setPaymentPanelId(null) : openPaymentPanel(s)}
                                >
                                  {isOpen ? 'Close' : 'Pay'}
                                </Button>
                              )}
                              <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-blue-50/40">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="space-y-4">
                                {/* Progress */}
                                <div>
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>Paid: <strong className="text-gray-800">{fmt(actualPaid, cur)}</strong></span>
                                    <span>Total: <strong className="text-gray-800">{fmt(Number(s.totalAmount), cur)}</strong></span>
                                    <span className="text-red-600 font-medium">Remaining: {fmt(remaining, cur)}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-emi-violet h-2 rounded-full transition-all"
                                      style={{ width: `${paidPct}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">{paidPct}% paid</p>
                                </div>

                                {/* Payment history */}
                                {s.payments && s.payments.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment history</p>
                                    <div className="space-y-1">
                                      {s.payments.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                                          <div className="flex items-center gap-3">
                                            <span className="text-gray-400 text-xs">{p.date}</span>
                                            <Badge variant="info">{p.paymentMethod.replace('_', ' ')}</Badge>
                                            {p.notes && <span className="text-gray-400 text-xs italic">{p.notes}</span>}
                                          </div>
                                          <span className="font-semibold text-emi-green">+{fmt(p.amount, cur)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Add payment form */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add a tranche</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="Amount"
                                      value={payAmount}
                                      onChange={(e) => setPayAmount(e.target.value)}
                                      min={0.01}
                                    />
                                    <Select
                                      value={payMethod}
                                      onChange={(e) => setPayMethod(e.target.value)}
                                      options={[
                                        { value: 'cash', label: 'Cash' },
                                        { value: 'transfer', label: 'Transfer' },
                                        { value: 'mobile_money', label: 'Mobile Money' },
                                      ]}
                                    />
                                    <Input
                                      type="date"
                                      value={payDate}
                                      onChange={(e) => setPayDate(e.target.value)}
                                    />
                                    <Input
                                      placeholder="Notes (optional)"
                                      value={payNotes}
                                      onChange={(e) => setPayNotes(e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    className="mt-2"
                                    size="sm"
                                    loading={addPaymentMutation.isPending}
                                    disabled={!payAmount || Number(payAmount) <= 0}
                                    onClick={() => addPaymentMutation.mutate({
                                      saleId: s.id,
                                      amount: Number(payAmount),
                                      paymentMethod: payMethod,
                                      date: payDate,
                                      notes: payNotes || undefined,
                                    })}
                                  >
                                    Record Payment
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  }) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-green-light text-emi-green mb-2">
                          <Icon name="sales" size={24} />
                        </div>
                        <p className="text-gray-500">{search ? 'No sales match your search.' : 'No sales yet. Add your first sale.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </div>
        </div>
      </div>
    </div>
  )
}
