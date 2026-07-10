import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Proforma, Customer, StockItem, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}
function useDebounce<T>(value: T, ms: number) {
  const [d, setD] = useState(value)
  useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t) }, [value, ms])
  return d
}

interface CartItem { stockItemId?: number; name: string; quantity: number; unitPrice: number }

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'info' | 'danger' | 'success'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'warning',
  converted: 'success',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  converted: 'Converti',
}

function CustomerPicker({ bid, value, onChange }: { bid: number; value: string; onChange: (id: string, name: string) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dq = useDebounce(q, 280)

  const { data: results } = useQuery<Customer[]>({
    queryKey: ['customer-search', bid, dq],
    queryFn: async () => {
      const r = await api.get('/customers', { params: { business_id: bid, search: dq, per_page: 10 } })
      return r.data.data ?? r.data
    },
    enabled: !!bid && dq.length > 0,
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = (c: Customer) => { onChange(String(c.id), c.name); setQ(c.name); setOpen(false) }
  const clear = () => { onChange('', ''); setQ(''); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); onChange('', ''); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un client…"
          className="w-full px-3 py-2.5 pr-8 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet transition-all"
        />
        {value && (
          <button type="button" onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      {open && (results?.length ?? 0) > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl">
          {results!.map((c) => (
            <button key={c.id} type="button" onMouseDown={() => select(c)}
              className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{c.name}</p>
              {c.email && <p className="text-xs text-zinc-400 truncate">{c.email}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProformasPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(today)
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<CartItem[]>([])
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [manualQty, setManualQty] = useState('1')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  const [sendTarget, setSendTarget] = useState<Proforma | null>(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')

  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const statusFilter = searchParams.get('status') ?? ''

  const { data, isLoading } = useQuery<PaginatedResponse<Proforma>>({
    queryKey: ['proformas', bid, statusFilter, page],
    queryFn: async () => (await api.get('/proformas', { params: { business_id: bid, status: statusFilter || undefined, page } })).data,
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

  const invalidate = () => qc.invalidateQueries({ queryKey: ['proformas', bid] })

  const createMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/proformas', p),
    onSuccess: () => { invalidate(); resetForm(); setFormSuccess(true); setTimeout(() => setFormSuccess(false), 3000) },
    onError: (err: unknown) => setFormError(extractError(err)),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/proformas/${id}`),
    onSuccess: invalidate,
  })
  const sendMutation = useMutation({
    mutationFn: ({ id, ...p }: Record<string, unknown>) => api.post(`/proformas/${id}/send`, p),
    onSuccess: () => { invalidate(); setSendTarget(null) },
  })
  const convertMutation = useMutation({
    mutationFn: (id: number) => api.post(`/proformas/${id}/convert`),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['sales', bid] }); qc.invalidateQueries({ queryKey: ['stock-items', bid] }) },
  })

  function extractError(err: unknown) {
    const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } }
    return e.response?.data?.error || e.response?.data?.errors?.[0]?.message || 'Erreur lors de l\'enregistrement.'
  }

  const resetForm = () => {
    setCustomerId(''); setDate(today); setValidUntil(''); setNotes(''); setItems([])
    setManualName(''); setManualPrice(''); setManualQty('1'); setFormError('')
  }

  const addToCart = (s: StockItem) => setItems(prev => {
    const idx = prev.findIndex(i => i.stockItemId === s.id)
    if (idx >= 0) return prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it)
    return [...prev, { stockItemId: s.id, name: s.name, quantity: 1, unitPrice: s.sellingPrice ?? 0 }]
  })
  const addManualItem = () => {
    if (!manualName.trim() || !manualPrice) return
    setItems(prev => [...prev, { name: manualName.trim(), quantity: Number(manualQty) || 1, unitPrice: Number(manualPrice) }])
    setManualName(''); setManualPrice(''); setManualQty('1')
  }
  const updateItem = (i: number, f: keyof CartItem, v: string | number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [f]: v } : it))
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (items.length === 0) { setFormError('Ajoutez au moins un article.'); return }
    createMutation.mutate({
      businessId: bid,
      customerId: customerId ? Number(customerId) : undefined,
      date: date || today,
      validUntil: validUntil || undefined,
      notes: notes || undefined,
      items: items.map(it => ({ stockItemId: it.stockItemId, name: it.name, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
    })
  }

  const openSend = (p: Proforma) => {
    setSendTarget(p)
    setSendEmail(p.customer?.email || '')
    setSendMessage('')
  }

  const handleExport = async (p: Proforma) => {
    const res = await api.get(`/proformas/${p.id}/export`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${p.reference}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const proformas = data?.data ?? []
  const meta = data?.meta

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
        <Icon name="reports" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500">Sélectionnez un business pour gérer les proformas.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Proformas</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emi-violet inline-block" />
            Nouveau proforma
          </h2>
          <button type="button" onClick={resetForm} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Vider</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Client</p>
              <CustomerPicker bid={bid} value={customerId} onChange={(id) => setCustomerId(id)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Input label="Valide jusqu'au" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
            <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optionnel" />

            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Produits</p>
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
                  <input type="number" min={0} step="0.01" value={manualPrice} onChange={e => setManualPrice(e.target.value)} placeholder="Prix unitaire *"
                    className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30" />
                  <input type="number" min={0.001} step="any" value={manualQty} onChange={e => setManualQty(e.target.value)} placeholder="Quantité"
                    className="w-full px-3 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30" />
                </div>
                <Button type="button" size="sm" onClick={addManualItem} disabled={!manualName.trim() || !manualPrice}>Ajouter</Button>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-600 dark:text-red-400">{formError}</div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Proforma créé avec succès !
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Articles</p>
            {items.length > 0 ? (
              <div className="space-y-2 flex-1">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{it.name}</p>
                      <p className="text-xs text-zinc-400">{fmt(it.unitPrice, cur)} / unité</p>
                    </div>
                    <input type="number" min={0.001} step="any" value={it.quantity}
                      onChange={e => updateItem(i, 'quantity', Math.max(0.001, Number(e.target.value)))}
                      className="w-14 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1" />
                    <input type="number" min={0} step="0.01" value={it.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                      className="w-20 text-right text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1 px-1" />
                    <button type="button" onClick={() => removeItem(i)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl py-10 text-center flex items-center justify-center">
                <p className="text-xs text-zinc-400">Aucun article<br />Ajoutez des produits</p>
              </div>
            )}
            <div className={`rounded-2xl p-4 ${items.length > 0 ? 'bg-gradient-to-br from-emi-violet to-violet-500' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${items.length > 0 ? 'text-violet-100' : 'text-zinc-500'}`}>{items.length} article{items.length > 1 ? 's' : ''}</span>
                <span className={`text-2xl font-black ${items.length > 0 ? 'text-white' : 'text-zinc-400'}`}>{fmt(total, cur)}</span>
              </div>
              <Button type="submit" className="w-full" loading={createMutation.isPending} disabled={items.length === 0}>
                Créer le proforma
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'draft', 'sent', 'accepted', 'converted'].map(s => (
          <button key={s || 'all'} type="button"
            onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); s ? n.set('status', s) : n.delete('status'); n.set('page', '1'); return n })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-emi-violet text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700'}`}>
            {s ? STATUS_LABEL[s] : 'Tous'}
          </button>
        ))}
      </div>

      {isLoading ? <Loader /> : (
        <div className="space-y-3">
          {proformas.length ? proformas.map(p => (
            <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <Link to={`/proformas/${p.id}`} className="flex items-start justify-between gap-3 -m-1 p-1 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{p.reference}</span>
                    <Badge variant={STATUS_VARIANT[p.status]} dot>{STATUS_LABEL[p.status]}</Badge>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{p.customer?.name || 'Client de passage'}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {String(p.date).slice(0, 10)} · {p.items?.length ?? 0} article{(p.items?.length ?? 0) > 1 ? 's' : ''}
                    {p.validUntil && ` · valide jusqu'au ${String(p.validUntil).slice(0, 10)}`}
                  </p>
                  {p.status === 'converted' && p.saleId && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Convertie en vente #{p.saleId}</p>
                  )}
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 shrink-0">{fmt(Number(p.totalAmount), cur)}</p>
              </Link>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleExport(p)}>
                  <Icon name="download" size={13} className="mr-1" /> Exporter
                </Button>
                {p.status !== 'converted' && (
                  <Button size="sm" variant="outline" onClick={() => openSend(p)}>
                    <Icon name="mail" size={13} className="mr-1" /> Envoyer
                  </Button>
                )}
                {(p.status === 'sent' || p.status === 'accepted') && (
                  <Button size="sm" onClick={() => convertMutation.mutate(p.id)} loading={convertMutation.isPending}>Convertir en vente</Button>
                )}
                {p.status !== 'converted' && (
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => window.confirm('Supprimer ce proforma ?') && deleteMutation.mutate(p.id)}>Supprimer</Button>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 py-16 text-center">
              <p className="text-sm text-zinc-400">Aucun proforma pour le moment.</p>
            </div>
          )}
          {meta && meta.lastPage > 1 && (
            <Pagination meta={meta} onPageChange={(p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })} />
          )}
        </div>
      )}

      <Modal isOpen={!!sendTarget} onClose={() => setSendTarget(null)} title={`Envoyer ${sendTarget?.reference ?? ''} au client`}>
        <div className="space-y-3">
          <Input label="Email du destinataire *" type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="client@exemple.com" />
          <Input label="Message (optionnel)" value={sendMessage} onChange={e => setSendMessage(e.target.value)} placeholder="Un mot pour le client…" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setSendTarget(null)} className="flex-1">Annuler</Button>
            <Button
              type="button" className="flex-1"
              loading={sendMutation.isPending}
              disabled={!sendEmail.trim()}
              onClick={() => sendTarget && sendMutation.mutate({ id: sendTarget.id, email: sendEmail.trim(), message: sendMessage.trim() || undefined })}
            >
              Envoyer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
