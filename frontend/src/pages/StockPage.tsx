import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { StatCard } from '../components/ui/Card'
import { useAppStore, useThemeStore } from '../stores'
import api from '../services/api'
import type { StockItem, Supplier, Rotation, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

// ── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(items: StockItem[], currency: string) {
  const header = ['Nom', 'SKU', 'Catégorie', 'Unité', 'Qté', 'Qté min', 'Prix achat', 'Prix vente', 'Valeur stock']
  const rows = items.map(i => [
    `"${i.name}"`,
    i.sku || '',
    i.category || '',
    i.unit,
    i.quantity,
    i.minQuantity,
    i.purchasePrice ?? '',
    i.sellingPrice ?? '',
    ((i.sellingPrice || 0) * i.quantity).toFixed(2),
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventaire-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Stock-level bar for cards ────────────────────────────────────────────────
function StockBar({ quantity, minQuantity }: { quantity: number; minQuantity: number }) {
  const max = Math.max(minQuantity * 3, quantity, 1)
  const pct = Math.min(100, Math.round((quantity / max) * 100))
  const minPct = Math.min(100, Math.round((minQuantity / max) * 100))
  const isLow = quantity <= minQuantity
  const color = isLow ? '#EF4444' : quantity <= minQuantity * 1.5 ? '#F59E0B' : '#10B981'
  return (
    <div className="relative w-full bg-gray-100 dark:bg-zinc-700 rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      {minQuantity > 0 && (
        <div className="absolute top-0 h-1.5 w-0.5 bg-gray-400 dark:bg-zinc-500" style={{ left: `${minPct}%` }} title={`Min: ${minQuantity}`} />
      )}
    </div>
  )
}

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  item, cur, onStockIn, onEdit, onDelete,
}: {
  item: StockItem
  cur: string
  onStockIn: (item: StockItem) => void
  onEdit: (item: StockItem) => void
  onDelete: (id: number) => void
}) {
  const isLow = item.quantity <= item.minQuantity
  const isOut = item.quantity === 0
  return (
    <div className={`relative bg-white dark:bg-zinc-900 rounded-2xl border transition-all ${
      isOut ? 'border-red-300 dark:border-red-800' :
      isLow ? 'border-amber-300 dark:border-amber-800' :
      'border-zinc-200 dark:border-zinc-800'
    } shadow-sm hover:shadow-md p-4 flex flex-col gap-3`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/stock/${item.id}`}
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emi-violet transition-colors text-sm leading-tight line-clamp-2"
          >
            {item.name}
          </Link>
          {item.sku && <p className="text-xs text-zinc-400 mt-0.5">{item.sku}</p>}
        </div>
        {isOut ? (
          <Badge variant="danger">Rupture</Badge>
        ) : isLow ? (
          <Badge variant="warning">Bas</Badge>
        ) : (
          <Badge variant="success">OK</Badge>
        )}
      </div>

      {/* Category */}
      {item.category && (
        <span className="inline-block self-start text-xs bg-violet-50 dark:bg-violet-950/30 text-emi-violet px-2 py-0.5 rounded-full font-medium">
          {item.category}
        </span>
      )}

      {/* Stock level */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>Stock</span>
          <span className={`font-bold text-sm ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
            {item.quantity} <span className="font-normal text-xs">{item.unit}</span>
          </span>
        </div>
        <StockBar quantity={item.quantity} minQuantity={item.minQuantity} />
        {item.minQuantity > 0 && (
          <p className="text-xs text-zinc-400 mt-1">Min requis : {item.minQuantity} {item.unit}</p>
        )}
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-2">
          <p className="text-zinc-400 mb-0.5">Achat</p>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">
            {item.purchasePrice != null ? fmt(item.purchasePrice, cur) : '—'}
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-2">
          <p className="text-zinc-400 mb-0.5">Vente</p>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">
            {item.sellingPrice != null ? fmt(item.sellingPrice, cur) : '—'}
          </p>
        </div>
      </div>

      {/* Value */}
      {item.sellingPrice != null && (
        <p className="text-xs text-zinc-400">
          Valeur stock : <span className="font-semibold text-emi-violet">{fmt(item.sellingPrice * item.quantity, cur)}</span>
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => onStockIn(item)}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emi-green hover:bg-emi-green hover:text-white transition-colors"
        >
          <Icon name="plus" size={12} /> Entrée
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          title="Modifier"
        >
          <Icon name="edit" size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors"
          title="Supprimer"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function StockPage() {
  const { currentBusiness } = useAppStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [showChart, setShowChart] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const categoryFilter = searchParams.get('category') ?? ''
  const [inputValue, setInputValue] = useState(search)
  const searchRef = useRef<HTMLInputElement>(null)

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
    queryFn: async () =>
      (await api.get('/stock-items', { params: { business_id: bid, search, page, category: categoryFilter || undefined } })).data,
    enabled: !!bid,
  })

  // Fetch all items (for chart + export, no pagination limit)
  const { data: allData } = useQuery<PaginatedResponse<StockItem>>({
    queryKey: ['stock-items-all', bid],
    queryFn: async () =>
      (await api.get('/stock-items', { params: { business_id: bid, per_page: 500 } })).data,
    enabled: !!bid,
  })

  const { data: categories } = useQuery<string[]>({
    queryKey: ['stock-categories', bid],
    queryFn: async () =>
      (await api.get('/stock-items/categories', { params: { business_id: bid } })).data,
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
      queryClient.invalidateQueries({ queryKey: ['stock-items-all'] })
      queryClient.invalidateQueries({ queryKey: ['stock-categories'] })
      setShowNewProduct(false)
      resetNewProductForm()
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...payload }: Record<string, unknown>) => api.put(`/stock-items/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items-all'] })
      queryClient.invalidateQueries({ queryKey: ['stock-categories'] })
      setEditProduct(null)
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/stock-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items-all'] })
      queryClient.invalidateQueries({ queryKey: ['stock-categories'] })
    },
  })

  const stockInMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/stock-transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items-all'] })
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] })
      setShowStockIn(false)
      setStockInProductId(null)
      resetStockInForm()
    },
  })

  // Helpers
  const resetNewProductForm = () => {
    setNewName(''); setNewSku(''); setNewUnit(''); setNewCategory('')
    setNewSellingPrice(''); setNewPurchasePrice(''); setNewMinQty(''); setNewDescription('')
  }

  const resetStockInForm = () => {
    setSiProductId(''); setSiQuantity(''); setSiUnitPrice(''); setSiSupplierId('')
    setSiRotationId(''); setSiNotes(''); setSiDate(new Date().toISOString().split('T')[0])
  }

  const openEdit = (item: StockItem) => {
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

  const openStockIn = (item: StockItem) => {
    setStockInProductId(item.id)
    setSiProductId(String(item.id))
    setSiUnitPrice(item.purchasePrice != null ? String(item.purchasePrice) : '')
    setShowStockIn(true)
  }

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

  const handleDelete = (id: number) => {
    if (window.confirm('Supprimer ce produit et tout son historique ?')) deleteProductMutation.mutate(id)
  }

  const applySearch = (e?: FormEvent) => {
    e?.preventDefault()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (inputValue.trim()) next.set('search', inputValue.trim())
      else next.delete('search')
      next.set('page', '1')
      return next
    })
  }

  const clearSearch = () => {
    setInputValue('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('search')
      next.set('page', '1')
      return next
    })
    searchRef.current?.focus()
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

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-5">
        <Icon name="stock" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un business pour gérer l'inventaire.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const items = data?.data ?? []
  const allItems = allData?.data ?? []
  const meta = data?.meta

  // Stats (from allItems for accuracy)
  const totalItems = allData?.meta?.total ?? items.length
  const lowStockItems = allItems.filter(i => i.quantity > 0 && i.quantity <= i.minQuantity)
  const outOfStockItems = allItems.filter(i => i.quantity === 0)
  const inventoryValue = allItems.reduce((sum, i) => sum + i.quantity * (i.sellingPrice || 0), 0)

  // Chart data: top 12 products by quantity (for stock level chart)
  const chartItems = [...allItems]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 12)
  const barData = chartItems.map(i => ({
    name: i.name.length > 14 ? i.name.slice(0, 14) + '…' : i.name,
    Quantité: i.quantity,
    Minimum: i.minQuantity,
  }))

  // Pie chart: category distribution
  const catMap: Record<string, number> = {}
  for (const i of allItems) {
    const c = i.category || 'Sans catégorie'
    catMap[c] = (catMap[c] || 0) + 1
  }
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }))
  const PIE_COLORS = ['#7C3AED', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const textColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Inventaire</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentBusiness?.name} · {totalItems} produit{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportCSV(allItems, cur)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Icon name="download" size={15} /> Exporter CSV
          </button>
          <Button variant="secondary" size="sm" onClick={() => { setStockInProductId(null); resetStockInForm(); setShowStockIn(true) }}>
            <Icon name="arrow-down" size={15} className="mr-1" /> Entrée stock
          </Button>
          <Button size="sm" onClick={() => setShowNewProduct(true)}>
            <Icon name="plus" size={15} className="mr-1" /> Nouveau produit
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total produits"
          value={totalItems}
          color="violet"
          icon={<Icon name="package" size={18} />}
        />
        <StatCard
          title="Stock bas"
          value={lowStockItems.length}
          subtitle={lowStockItems.length > 0 ? 'à réapprovisionner' : 'tout est OK'}
          color={lowStockItems.length > 0 ? 'amber' : 'green'}
          icon={<Icon name="alert" size={18} />}
        />
        <StatCard
          title="Rupture"
          value={outOfStockItems.length}
          subtitle={outOfStockItems.length > 0 ? 'articles épuisés' : 'aucune rupture'}
          color={outOfStockItems.length > 0 ? 'red' : 'green'}
          icon={<Icon name="x" size={18} />}
        />
        <StatCard
          title="Valeur stock"
          value={fmt(inventoryValue, cur)}
          color="green"
          icon={<Icon name="dollar-sign" size={18} />}
        />
      </div>

      {/* ── Low-stock alert strip ── */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="alert" size={16} className="text-amber-500" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {lowStockItems.length} produit{lowStockItems.length > 1 ? 's' : ''} en stock bas
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.slice(0, 8).map(i => (
              <button
                key={i.id}
                onClick={() => openStockIn(i)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors"
              >
                <Icon name="plus" size={11} />
                {i.name} ({i.quantity}/{i.minQuantity})
              </button>
            ))}
            {lowStockItems.length > 8 && (
              <span className="text-xs text-amber-500 self-center">+{lowStockItems.length - 8} autres</span>
            )}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      {allItems.length > 0 && (
        <div>
          <button
            onClick={() => setShowChart(v => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-3 transition-colors"
          >
            <Icon name={showChart ? 'chevron-down' : 'chevron-right'} size={14} />
            {showChart ? 'Masquer les graphiques' : 'Afficher les graphiques'}
          </button>

          {showChart && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
              {/* Stock levels bar chart */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Niveaux de stock</p>
                <p className="text-xs text-zinc-400 mb-4">Top {chartItems.length} produits · quantité vs minimum</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#18181b' : '#fff',
                        border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="Quantité" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.Quantité <= entry.Minimum ? '#EF4444' : entry.Quantité <= entry.Minimum * 1.5 ? '#F59E0B' : '#7C3AED'}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Minimum" fill={isDark ? '#3f3f46' : '#e4e4e7'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category pie */}
              {pieData.length > 1 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Par catégorie</p>
                  <p className="text-xs text-zinc-400 mb-3">Répartition des produits</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: isDark ? '#18181b' : '#fff',
                          border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Search + Filter + View toggle ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2 p-3">
          {/* Search */}
          <form onSubmit={applySearch} className="flex-1 relative">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher par nom ou SKU…"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
              className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emi-violet focus:ring-1 focus:ring-emi-violet/30 transition"
            />
            {inputValue && (
              <button type="button" onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <Icon name="x" size={14} />
              </button>
            )}
          </form>

          {/* Category filter */}
          {categories && categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => applyCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emi-violet transition"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setView('cards')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'cards' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emi-violet' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
              title="Vue cartes"
            >
              <Icon name="grid" size={16} />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emi-violet' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
              title="Vue tableau"
            >
              <Icon name="list" size={16} />
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(search || categoryFilter) && (
          <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
            {search && (
              <span className="inline-flex items-center gap-1 text-xs bg-violet-50 dark:bg-violet-950/30 text-emi-violet border border-violet-100 dark:border-violet-800 px-2 py-0.5 rounded-full">
                "{search}"
                <button onClick={clearSearch}><Icon name="x" size={10} /></button>
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 text-xs bg-violet-50 dark:bg-violet-950/30 text-emi-violet border border-violet-100 dark:border-violet-800 px-2 py-0.5 rounded-full">
                {categoryFilter}
                <button onClick={() => applyCategory('')}><Icon name="x" size={10} /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Cards view ── */}
        {view === 'cards' && (
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
            {items.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {items.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    cur={cur}
                    onStockIn={openStockIn}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
                  <Icon name="stock" size={26} />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {search ? 'Aucun produit ne correspond à votre recherche.' : 'Aucun produit pour l\'instant. Ajoutez votre premier produit.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Table view ── */}
        {view === 'table' && (
          <div className="overflow-x-auto border-t border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  {['Produit', 'Qté', 'Min', 'Unité', 'Achat', 'Vente', 'Statut', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.length ? items.map(item => {
                  const isLow = item.quantity <= item.minQuantity
                  const isOut = item.quantity === 0
                  return (
                    <tr key={item.id} className={`transition-colors ${isOut ? 'bg-red-50/40 dark:bg-red-950/10' : isLow ? 'bg-amber-50/40 dark:bg-amber-950/10' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'}`}>
                      <td className="px-4 py-3">
                        <Link to={`/stock/${item.id}`} className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-emi-violet transition-colors">
                          {item.name}
                        </Link>
                        {item.sku && <p className="text-xs text-zinc-400">{item.sku}</p>}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{item.minQuantity}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{item.unit}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {item.purchasePrice != null ? fmt(item.purchasePrice, cur) : '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {item.sellingPrice != null ? fmt(item.sellingPrice, cur) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isOut ? <Badge variant="danger">Rupture</Badge> :
                         isLow ? <Badge variant="warning">Bas</Badge> :
                         <Badge variant="success">OK</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openStockIn(item)} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emi-green hover:bg-emi-green hover:text-white transition-colors" title="Entrée stock">
                            <Icon name="plus" size={13} />
                          </button>
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" title="Modifier">
                            <Icon name="edit" size={13} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors" title="Supprimer">
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
                      {search ? 'Aucun résultat.' : 'Aucun produit.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
      </div>

      {/* ── New Product Modal ── */}
      <Modal isOpen={showNewProduct} onClose={() => setShowNewProduct(false)} title="Nouveau produit">
        <form onSubmit={handleCreateProduct} className="space-y-3">
          <Input label="Nom *" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Nom du produit" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" value={newSku} onChange={e => setNewSku(e.target.value)} placeholder="ABC-123" />
            <Input label="Unité" value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="kg, pcs…" />
          </div>
          <Input label="Catégorie" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="ex : Légumes, Boissons" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prix d'achat" type="number" step="0.01" value={newPurchasePrice} onChange={e => setNewPurchasePrice(e.target.value)} placeholder="0.00" />
            <Input label="Prix de vente" type="number" step="0.01" value={newSellingPrice} onChange={e => setNewSellingPrice(e.target.value)} placeholder="0.00" />
          </div>
          <Input label="Qté minimale (alerte)" type="number" value={newMinQty} onChange={e => setNewMinQty(e.target.value)} placeholder="0" />
          <Input label="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Optionnel" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowNewProduct(false)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={createProductMutation.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Product Modal ── */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Modifier le produit">
        <form onSubmit={handleUpdateProduct} className="space-y-3">
          <Input label="Nom *" value={editName} onChange={e => setEditName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" value={editSku} onChange={e => setEditSku(e.target.value)} />
            <Input label="Unité" value={editUnit} onChange={e => setEditUnit(e.target.value)} />
          </div>
          <Input label="Catégorie" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prix d'achat" type="number" step="0.01" value={editPurchasePrice} onChange={e => setEditPurchasePrice(e.target.value)} />
            <Input label="Prix de vente" type="number" step="0.01" value={editSellingPrice} onChange={e => setEditSellingPrice(e.target.value)} />
          </div>
          <Input label="Qté minimale (alerte)" type="number" value={editMinQty} onChange={e => setEditMinQty(e.target.value)} />
          <Input label="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditProduct(null)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={updateProductMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* ── Stock-In Modal ── */}
      <Modal isOpen={showStockIn} onClose={() => { setShowStockIn(false); setStockInProductId(null) }} title="Entrée de stock">
        <form onSubmit={handleStockIn} className="space-y-3">
          {!stockInProductId ? (
            <Select
              label="Produit *"
              options={allItems.map(i => ({ value: String(i.id), label: `${i.name}${i.sku ? ` (${i.sku})` : ''}` }))}
              placeholder="Sélectionner un produit…"
              value={siProductId}
              onChange={e => {
                setSiProductId(e.target.value)
                const sel = allItems.find(i => i.id === Number(e.target.value))
                if (sel?.purchasePrice != null) setSiUnitPrice(String(sel.purchasePrice))
              }}
              required
            />
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 text-sm">
              <span className="text-zinc-500">Produit : </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {allItems.find(i => i.id === stockInProductId)?.name}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantité *" type="number" step="0.01" value={siQuantity} onChange={e => setSiQuantity(e.target.value)} required placeholder="0" />
            <Input label="Prix unitaire" type="number" step="0.01" value={siUnitPrice} onChange={e => setSiUnitPrice(e.target.value)} placeholder="0.00" />
          </div>
          <Input label="Date" type="date" value={siDate} onChange={e => setSiDate(e.target.value)} />
          {suppliers && suppliers.length > 0 && (
            <Select
              label="Fournisseur (optionnel)"
              options={suppliers.map(s => ({ value: String(s.id), label: s.name }))}
              placeholder="Sans fournisseur"
              value={siSupplierId}
              onChange={e => setSiSupplierId(e.target.value)}
            />
          )}
          {rotations && rotations.filter(r => r.status === 'active').length > 0 && (
            <Select
              label="Rotation (optionnel)"
              options={rotations.filter(r => r.status === 'active').map(r => ({ value: String(r.id), label: r.name }))}
              placeholder="Sans rotation"
              value={siRotationId}
              onChange={e => setSiRotationId(e.target.value)}
            />
          )}
          <Input label="Notes" value={siNotes} onChange={e => setSiNotes(e.target.value)} placeholder="ex : Livraison Fournisseur X" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowStockIn(false); setStockInProductId(null) }} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={stockInMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
