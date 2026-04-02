import { useState, useEffect, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { StockItem, PaginatedResponse } from '../types'

export function StockPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [unit, setUnit] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [description, setDescription] = useState('')

  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [inputValue, setInputValue] = useState(search)

  useEffect(() => { setInputValue(search) }, [search])

  const { data, isLoading } = useQuery<PaginatedResponse<StockItem>>({
    queryKey: ['stock-items', bid, search, page],
    queryFn: async () => (await api.get('/stock-items', { params: { business_id: bid, search, page } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/stock-items', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items', bid] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/stock-items/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock-items', bid] }),
  })

  const resetForm = () => {
    setName('')
    setSku('')
    setUnit('')
    setPurchasePrice('')
    setSellingPrice('')
    setQuantity('')
    setMinQuantity('')
    setDescription('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid,
      name,
      sku: sku || undefined,
      unit,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      sellingPrice: sellingPrice ? Number(sellingPrice) : undefined,
      quantity: quantity ? Number(quantity) : undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      description: description || undefined,
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this stock item?')) deleteMutation.mutate(id)
  }

  const applySearch = (e: FormEvent) => {
    e.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (inputValue.trim()) next.set('search', inputValue.trim())
      else next.delete('search')
      next.set('page', '1')
      return next
    })
  }

  const handlePageChange = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emi-violet-light text-emi-violet mb-4">
        <Icon name="stock" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to manage inventory.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const items = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product name" />
              <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="ABC-123" />
              <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} required placeholder="pcs, kg, etc." />
              <Input label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              <Input label="Purchase Price" type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0.00" />
              <Input label="Selling Price" type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" />
              <Input label="Min Quantity (Alert)" type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} placeholder="0" />
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              <Button type="submit" className="w-full" loading={createMutation.isPending}>Add Item</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={applySearch} className="flex gap-2">
                <Input
                  placeholder="Search by name or SKU…"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit" variant="secondary">Search</Button>
              </form>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length ? items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-500">{item.sku || '-'}</td>
                      <td className={`px-6 py-4 font-medium ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                      <td className="px-6 py-4 text-gray-900">{item.sellingPrice != null ? `$${item.sellingPrice}` : '-'}</td>
                      <td className="px-6 py-4">
                        {item.quantity <= item.minQuantity
                          ? <Badge variant="danger">Low stock</Badge>
                          : <Badge variant="success">In stock</Badge>
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                          <Icon name="stock" size={24} />
                        </div>
                        <p className="text-gray-500">{search ? 'No items match your search.' : 'No items yet. Add your first item.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
          </div>
        </div>
      </div>
    </div>
  )
}
