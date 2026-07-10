import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore, useAuthStore } from '../stores'
import api from '../services/api'
import type { Requisition, Supplier, StockItem, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

interface CartItem { stockItemId?: number; name: string; quantity: number; estimatedUnitPrice: number }

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'info' | 'danger' | 'success'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'info',
  rejected: 'danger',
  converted: 'success',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  converted: 'Convertie',
}

export function RequisitionsPage() {
  const { currentBusiness } = useAppStore()
  const { user } = useAuthStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  const currentRole = user?.role === 'superadmin' ? 'admin' : (bid ? user?.businessRoles?.[bid] : null)
  const canApprove = currentRole === 'admin' || currentRole === 'manager'

  // Form state
  const [editId, setEditId] = useState<number | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [date, setDate] = useState(today)
  const [neededByDate, setNeededByDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<CartItem[]>([])
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [manualQty, setManualQty] = useState('1')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const { data, isLoading } = useQuery<PaginatedResponse<Requisition>>({
    queryKey: ['requisitions', bid, statusFilter, page],
    queryFn: async () => (await api.get('/requisitions', { params: { business_id: bid, status: statusFilter || undefined, page } })).data,
    enabled: !!bid,
  })
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ['suppliers-all', bid],
    queryFn: async () => {
      const r = await api.get('/suppliers', { params: { business_id: bid, per_page: 200 } })
      return r.data.data ?? r.data
    },
    enabled: !!bid,
  })
  const { data: stockItems = [] } = useQuery<StockItem[]>({
    queryKey: ['stock-items', bid],
    queryFn: async () => {
      const r = await api.get('/stock-items', { params: { business_id: bid, per_page: 500 } })
      return r.data.data ?? r.data
    },
    enabled: !!bid,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['requisitions', bid] })
    qc.invalidateQueries({ queryKey: ['stock-items', bid] })
    qc.invalidateQueries({ queryKey: ['transactions', bid] })
  }

  const createMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/requisitions', p),
    onSuccess: () => { invalidate(); resetForm(); setFormSuccess(true); setTimeout(() => setFormSuccess(false), 3000) },
    onError: (err: unknown) => setFormError(extractError(err)),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...p }: Record<string, unknown>) => api.put(`/requisitions/${id}`, p),
    onSuccess: () => { invalidate(); resetForm() },
    onError: (err: unknown) => setFormError(extractError(err)),
  })
  const submitMutation = useMutation({
    mutationFn: (id: number) => api.post(`/requisitions/${id}/submit`),
    onSuccess: invalidate,
  })
  const approveMutation = useMutation({
    mutationFn: (id: number) => api.post(`/requisitions/${id}/approve`),
    onSuccess: invalidate,
  })
  const rejectMutation = useMutation({
    mutationFn: (id: number) => api.post(`/requisitions/${id}/reject`, { rejectionReason: window.prompt('Motif du rejet (optionnel)') || undefined }),
    onSuccess: invalidate,
  })
  const convertMutation = useMutation({
    mutationFn: (id: number) => api.post(`/requisitions/${id}/convert`),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/requisitions/${id}`),
    onSuccess: invalidate,
  })

  function extractError(err: unknown) {
    const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } }
    return e.response?.data?.error || e.response?.data?.errors?.[0]?.message || 'Erreur lors de l\'enregistrement.'
  }

  const resetForm = () => {
    setEditId(null); setSupplierId(''); setDate(today); setNeededByDate('')
    setNotes(''); setItems([]); setFormError('')
    setManualName(''); setManualPrice(''); setManualQty('1')
  }

  const openEdit = (r: Requisition) => {
    setEditId(r.id)
    setSupplierId(r.supplierId ? String(r.supplierId) : '')
    setDate(String(r.date).slice(0, 10))
    setNeededByDate(r.neededByDate ? String(r.neededByDate).slice(0, 10) : '')
    setNotes(r.notes || '')
    setItems((r.items ?? []).map(it => ({ stockItemId: it.stockItemId ?? undefined, name: it.name, quantity: Number(it.quantity), estimatedUnitPrice: Number(it.estimatedUnitPrice ?? 0) })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addToCart = (s: StockItem) => setItems(prev => {
    const idx = prev.findIndex(i => i.stockItemId === s.id)
    if (idx >= 0) return prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it)
    return [...prev, { stockItemId: s.id, name: s.name, quantity: 1, estimatedUnitPrice: s.purchasePrice ?? 0 }]
  })
  const addManualItem = () => {
    if (!manualName.trim()) return
    setItems(prev => [...prev, { name: manualName.trim(), quantity: Number(manualQty) || 1, estimatedUnitPrice: Number(manualPrice) || 0 }])
    setManualName(''); setManualPrice(''); setManualQty('1')
  }
  const updateItem = (i: number, f: keyof CartItem, v: string | number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [f]: v } : it))
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const total = items.reduce((sum, it) => sum + it.quantity * it.estimatedUnitPrice, 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (items.length === 0) { setFormError('Ajoutez au moins un article.'); return }
    const payload = {
      businessId: bid,
      supplierId: supplierId ? Number(supplierId) : undefined,
      date: date || today,
      neededByDate: neededByDate || undefined,
      notes: notes || undefined,
      items: items.map(it => ({ stockItemId: it.stockItemId, name: it.name, quantity: Number(it.quantity), estimatedUnitPrice: Number(it.estimatedUnitPrice) })),
    }
    editId ? updateMutation.mutate({ id: editId, ...payload }) : createMutation.mutate(payload)
  }

  const requisitions = data?.data ?? []
  const meta = data?.meta

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
        <Icon name="package" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500">Sélectionnez un business pour gérer les réquisitions.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Réquisitions</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emi-violet inline-block" />
            {editId ? `Modifier ${requisitions.find(r => r.id === editId)?.reference ?? ''}` : 'Nouvelle réquisition'}
          </h2>
          <button type="button" onClick={resetForm} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            {editId ? 'Annuler' : 'Vider'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Fournisseur" value={supplierId} onChange={e => setSupplierId(e.target.value)} placeholder="Aucun (optionnel)"
                options={suppliers.map(s => ({ value: String(s.id), label: s.name }))} />
              <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Input label="Besoin avant le" type="date" value={neededByDate} onChange={e => setNeededByDate(e.target.value)} />
              <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optionnel" />
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Ajouter des articles</p>
              {stockItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {stockItems.slice(0, 8).map(s => (
                    <button key={s.id} type="button" onClick={() => addToCart(s)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emi-violet hover:text-white text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-all active:scale-95">
                      <span>+</span> {s.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Article libre</p>
                <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Nom de l'article *"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={0} step="0.01" value={manualPrice} onChange={e => setManualPrice(e.target.value)} placeholder="Prix estimé"
                    className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30" />
                  <input type="number" min={0.001} step="any" value={manualQty} onChange={e => setManualQty(e.target.value)} placeholder="Quantité"
                    className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30" />
                </div>
                <Button type="button" size="sm" onClick={addManualItem} disabled={!manualName.trim()}>Ajouter</Button>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Réquisition créée avec succès !
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Articles demandés</p>
            {items.length > 0 ? (
              <div className="space-y-2 flex-1">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{it.name}</p>
                      <p className="text-xs text-zinc-400">{fmt(it.estimatedUnitPrice, cur)} / unité (est.)</p>
                    </div>
                    <input type="number" min={0.001} step="any" value={it.quantity}
                      onChange={e => updateItem(i, 'quantity', Math.max(0.001, Number(e.target.value)))}
                      className="w-14 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1" />
                    <input type="number" min={0} step="0.01" value={it.estimatedUnitPrice}
                      onChange={e => updateItem(i, 'estimatedUnitPrice', Number(e.target.value))}
                      className="w-20 text-right text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 px-1" />
                    <button type="button" onClick={() => removeItem(i)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl py-10 text-center flex items-center justify-center">
                <p className="text-xs text-zinc-400">Aucun article<br />Ajoutez des articles à demander</p>
              </div>
            )}
            <div className="rounded-2xl p-4 bg-zinc-100 dark:bg-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-500">{items.length} article{items.length > 1 ? 's' : ''}</span>
                <span className="text-2xl font-black text-zinc-700 dark:text-zinc-200">{fmt(total, cur)} <span className="text-xs font-normal">est.</span></span>
              </div>
              <Button type="submit" className="w-full" loading={createMutation.isPending || updateMutation.isPending} disabled={items.length === 0}>
                {editId ? 'Enregistrer les modifications' : 'Créer la réquisition (brouillon)'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'draft', 'pending', 'approved', 'rejected', 'converted'].map(s => (
          <button key={s || 'all'} type="button"
            onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); s ? n.set('status', s) : n.delete('status'); n.set('page', '1'); return n })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-emi-violet text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700'}`}>
            {s ? STATUS_LABEL[s] : 'Toutes'}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? <Loader /> : (
        <div className="space-y-3">
          {requisitions.length ? requisitions.map(r => (
            <div key={r.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <Link to={`/requisitions/${r.id}`} className="flex items-start justify-between gap-3 -m-1 p-1 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{r.reference}</span>
                    <Badge variant={STATUS_VARIANT[r.status]} dot>{STATUS_LABEL[r.status]}</Badge>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{r.supplier?.name || 'Sans fournisseur'}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{String(r.date).slice(0, 10)} · {r.items?.length ?? 0} article{(r.items?.length ?? 0) > 1 ? 's' : ''}</p>
                  {r.status === 'rejected' && r.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Motif: {r.rejectionReason}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 shrink-0">{fmt(Number(r.totalAmount), cur)}</p>
              </Link>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {r.status === 'draft' && (
                  <>
                    <Button size="sm" onClick={() => submitMutation.mutate(r.id)} loading={submitMutation.isPending}>Soumettre</Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Modifier</Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => window.confirm('Supprimer cette réquisition ?') && deleteMutation.mutate(r.id)}>Supprimer</Button>
                  </>
                )}
                {r.status === 'pending' && canApprove && (
                  <>
                    <Button size="sm" onClick={() => approveMutation.mutate(r.id)} loading={approveMutation.isPending}>Approuver</Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => rejectMutation.mutate(r.id)}>Rejeter</Button>
                  </>
                )}
                {r.status === 'approved' && (
                  <Button size="sm" onClick={() => convertMutation.mutate(r.id)} loading={convertMutation.isPending}>Convertir en achat</Button>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 py-16 text-center">
              <p className="text-sm text-zinc-400">Aucune réquisition pour le moment.</p>
            </div>
          )}
          {meta && meta.lastPage > 1 && (
            <Pagination meta={meta} onPageChange={(p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })} />
          )}
        </div>
      )}
    </div>
  )
}
