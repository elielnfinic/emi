import { useState, useEffect, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { StatCard } from '../components/ui/Card'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { StockItem, Supplier, Rotation, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

export function StockPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  // Tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'catalog'>('inventory')

  // Search / Pagination
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const categoryFilter = searchParams.get('category') ?? ''
  const [inputValue, setInputValue] = useState(search)

  useEffect(() => { setInputValue(search) }, [search])

  // Modals
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [showStockIn, setShowStockIn] = useState(false)
  const [editProduct, setEditProduct] = useState<StockItem | null>(null)
  const [stockInProductId, setStockInProductId] = useState<number | null>(null)

  // New Product form
  const [newName, setNewName] = useState('')
  const [newSku, setNewSku] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newSellingPrice, setNewSellingPrice] = useState('')
  const [newPurchasePrice, setNewPurchasePrice] = useState('')
  const [newMinQty, setNewMinQty] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Edit Product form
  const [editName, setEditName] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSellingPrice, setEditSellingPrice] = useState('')
  const [editPurchasePrice, setEditPurchasePrice] = useState('')
  const [editMinQty, setEditMinQty] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Stock-In form
  const [siProductId, setSiProductId] = useState('')
  const [siQuantity, setSiQuantity] = useState('')
  const [siUnitPrice, setSiUnitPrice] = useState('')
  const [siSupplierId, setSiSupplierId] = useState('')
  const [siRotationId, setSiRotationId] = useState('')
  const [siNotes, setSiNotes] = useState('')
  const [siDate, setSiDate] = useState(new Date().toISOString().split('T')[0])

  // Queries
  const { data, isLoading } = useQuery<PaginatedResponse<StockItem>>({
    queryKey: ['stock-items', bid, search, page, categoryFilter],
    queryFn: async () => (await api.get('/stock-items', { params: { business_id: bid, search, page, category: categoryFilter || undefined } })).data,
    enabled: !!bid,
  })

  const { data: categories } = useQuery<string[]>({
    queryKey: ['stock-categories', bid],
    queryFn: async () => (await api.get('/stock-items/categories', { params: { business_id: bid } })).data,
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
  const createProductMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/stock-items', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-categories'] })
      setShowNewProduct(false)
      resetNewProductForm()
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...payload }: Record<string, unknown>) => api.put(`/stock-items/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-categories'] })
      setEditProduct(null)
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/stock-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-categories'] })
    },
  })

  const stockInMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/stock-transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      setShowStockIn(false)
      setStockInProductId(null)
      resetStockInForm()
    },
  })

  // Form helpers
  const resetNewProductForm = () => {
    setNewName(''); setNewSku(''); setNewUnit(''); setNewCategory('')
    setNewSellingPrice(''); setNewPurchasePrice(''); setNewMinQty(''); setNewDescription('')
  }

  const resetStockInForm = () => {
    setSiProductId(''); setSiQuantity(''); setSiUnitPrice(''); setSiSupplierId('')
    setSiRotationId(''); setSiNotes(''); setSiDate(new Date().toISOString().split('T')[0])
  }

  const openEditProduct = (item: StockItem) => {
    setEditProduct(item)
    setEditName(item.name)
    setEditSku(item.sku || '')
    setEditUnit(item.unit)
    setEditCategory(item.category || '')
    setEditSellingPrice(item.sellingPrice != null ? String(item.sellingPrice) : '')
    setEditPurchasePrice(item.purchasePrice != null ? String(item.purchasePrice) : '')
    setEditMinQty(String(item.minQuantity))
    setEditDescription(item.description || '')
  }

  const openQuickStockIn = (item: StockItem) => {
    setStockInProductId(item.id)
    setSiProductId(String(item.id))
    setSiUnitPrice(item.purchasePrice != null ? String(item.purchasePrice) : '')
    setShowStockIn(true)
  }

  // Handlers
  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault()
    createProductMutation.mutate({
      businessId: bid,
      name: newName,
      sku: newSku || undefined,
      unit: newUnit || 'piece',
      category: newCategory || undefined,
      sellingPrice: newSellingPrice ? Number(newSellingPrice) : undefined,
      purchasePrice: newPurchasePrice ? Number(newPurchasePrice) : undefined,
      minQuantity: newMinQty ? Number(newMinQty) : 0,
      description: newDescription || undefined,
    })
  }

  const handleUpdateProduct = (e: FormEvent) => {
    e.preventDefault()
    if (!editProduct) return
    updateProductMutation.mutate({
      id: editProduct.id,
      name: editName,
      sku: editSku || null,
      unit: editUnit,
      category: editCategory || null,
      sellingPrice: editSellingPrice ? Number(editSellingPrice) : null,
      purchasePrice: editPurchasePrice ? Number(editPurchasePrice) : null,
      minQuantity: editMinQty ? Number(editMinQty) : 0,
      description: editDescription || null,
    })
  }

  const handleStockIn = (e: FormEvent) => {
    e.preventDefault()
    const productId = stockInProductId || Number(siProductId)
    if (!productId) return
    stockInMutation.mutate({
      businessId: bid,
      stockItemId: productId,
      type: 'in',
      quantity: Number(siQuantity),
      unitPrice: siUnitPrice ? Number(siUnitPrice) : undefined,
      supplierId: siSupplierId ? Number(siSupplierId) : undefined,
      rotationId: siRotationId ? Number(siRotationId) : undefined,
      notes: siNotes || undefined,
      date: siDate || undefined,
    })
  }

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Delete this product and all its stock history?')) deleteProductMutation.mutate(id)
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

  const applyCategory = (cat: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (cat) next.set('category', cat)
      else next.delete('category')
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

  // Compute summary stats
  const totalItems = meta?.total ?? items.length
  const lowStockItems = items.filter(i => i.quantity <= i.minQuantity)
  const inventoryValue = items.reduce((sum, i) => sum + i.quantity * (i.sellingPrice || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowNewProduct(true)}>
            <Icon name="plus" size={16} className="mr-1" /> New Product
          </Button>
          <Button variant="secondary" onClick={() => { setStockInProductId(null); resetStockInForm(); setShowStockIn(true) }}>
            <Icon name="arrow-down" size={16} className="mr-1" /> Stock-In
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Products" value={totalItems} color="violet" icon={<Icon name="package" size={22} />} />
        <StatCard title="Low Stock" value={lowStockItems.length} color={lowStockItems.length > 0 ? 'red' : 'green'} icon={<Icon name="alert" size={22} />} />
        <StatCard title="Inventory Value" value={fmt(inventoryValue, cur)} color="green" icon={<Icon name="dollar-sign" size={22} />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'catalog' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Product Catalog
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={applySearch} className="flex gap-2 flex-1">
              <Input
                placeholder="Search products by name or SKU…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            {categories && categories.length > 0 && (
              <Select
                options={categories.map(c => ({ value: c, label: c }))}
                placeholder="All Categories"
                value={categoryFilter}
                onChange={(e) => applyCategory(e.target.value)}
                className="sm:w-48"
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'inventory' ? (
            /* Stock Levels View */
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length ? items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link to={`/stock/${item.id}`} className="hover:text-emi-violet transition-colors">
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.sku || '-'}</td>
                    <td className={`px-6 py-4 font-medium ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-gray-900">{item.purchasePrice != null ? fmt(item.purchasePrice, cur) : '-'}</td>
                    <td className="px-6 py-4">
                      {item.quantity <= item.minQuantity
                        ? <Badge variant="danger">LOW</Badge>
                        : <Badge variant="success">Healthy</Badge>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openQuickStockIn(item)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emi-green-light text-emi-green hover:bg-emi-green hover:text-white transition-colors"
                          title="Quick Stock-In"
                        >
                          <Icon name="plus" size={14} />
                        </button>
                        <button
                          onClick={() => openEditProduct(item)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Edit Product"
                        >
                          <Icon name="settings" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                        <Icon name="stock" size={24} />
                      </div>
                      <p className="text-gray-500">{search ? 'No products match your search.' : 'No products yet. Add your first product.'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* Catalog View */
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length ? items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link to={`/stock/${item.id}`} className="hover:text-emi-violet transition-colors">
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.sku || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{item.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-gray-900">{item.purchasePrice != null ? fmt(item.purchasePrice, cur) : '-'}</td>
                    <td className="px-6 py-4 text-gray-900">{item.sellingPrice != null ? fmt(item.sellingPrice, cur) : '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{item.minQuantity}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditProduct(item)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Edit Product"
                        >
                          <Icon name="settings" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Product"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                        <Icon name="stock" size={24} />
                      </div>
                      <p className="text-gray-500">{search ? 'No products match your search.' : 'No products yet. Add your first product.'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
      </div>

      {/* New Product Modal */}
      <Modal isOpen={showNewProduct} onClose={() => setShowNewProduct(false)} title="New Product">
        <form onSubmit={handleCreateProduct} className="space-y-3">
          <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Product name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" value={newSku} onChange={(e) => setNewSku(e.target.value)} placeholder="ABC-123" />
            <Input label="Unit" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="kg, pcs, etc." />
          </div>
          <Input label="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Vegetables, Beverages" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Price" type="number" step="0.01" value={newPurchasePrice} onChange={(e) => setNewPurchasePrice(e.target.value)} placeholder="0.00" />
            <Input label="Selling Price" type="number" step="0.01" value={newSellingPrice} onChange={(e) => setNewSellingPrice(e.target.value)} placeholder="0.00" />
          </div>
          <Input label="Min Quantity (Alert)" type="number" value={newMinQty} onChange={(e) => setNewMinQty(e.target.value)} placeholder="0" />
          <Input label="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Optional description" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowNewProduct(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={createProductMutation.isPending}>Create Product</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        <form onSubmit={handleUpdateProduct} className="space-y-3">
          <Input label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} required placeholder="Product name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" value={editSku} onChange={(e) => setEditSku(e.target.value)} placeholder="ABC-123" />
            <Input label="Unit" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} placeholder="kg, pcs, etc." />
          </div>
          <Input label="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="e.g. Vegetables, Beverages" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Price" type="number" step="0.01" value={editPurchasePrice} onChange={(e) => setEditPurchasePrice(e.target.value)} placeholder="0.00" />
            <Input label="Selling Price" type="number" step="0.01" value={editSellingPrice} onChange={(e) => setEditSellingPrice(e.target.value)} placeholder="0.00" />
          </div>
          <Input label="Min Quantity (Alert)" type="number" value={editMinQty} onChange={(e) => setEditMinQty(e.target.value)} placeholder="0" />
          <Input label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Optional description" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditProduct(null)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={updateProductMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Stock-In Modal */}
      <Modal isOpen={showStockIn} onClose={() => { setShowStockIn(false); setStockInProductId(null) }} title="Stock-In / Provisioning">
        <form onSubmit={handleStockIn} className="space-y-3">
          {!stockInProductId ? (
            <Select
              label="Product"
              options={items.map(i => ({ value: String(i.id), label: `${i.name}${i.sku ? ` (${i.sku})` : ''}` }))}
              placeholder="Select a product…"
              value={siProductId}
              onChange={(e) => {
                setSiProductId(e.target.value)
                const selected = items.find(i => i.id === Number(e.target.value))
                if (selected?.purchasePrice != null) setSiUnitPrice(String(selected.purchasePrice))
              }}
              required
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">Product:</span>{' '}
              <span className="font-medium text-gray-900">{items.find(i => i.id === stockInProductId)?.name}</span>
            </div>
          )}
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
            <Button type="button" variant="secondary" onClick={() => { setShowStockIn(false); setStockInProductId(null) }} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" loading={stockInMutation.isPending}>Add Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}