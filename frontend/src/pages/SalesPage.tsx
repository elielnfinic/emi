import { useState, useEffect, useRef, Fragment, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
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

/* ─── helpers ─────────────────────────────────────────────────────────── */
function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}
function useDebounce<T>(value: T, ms: number) {
  const [d, setD] = useState(value)
  useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t) }, [value, ms])
  return d
}

interface CartItem { stockItemId?: number; name: string; quantity: number; unitPrice: number }

/* ─── Customer Combobox ────────────────────────────────────────────────── */
function CustomerCombobox({
  bid, value, onChange, required,
}: {
  bid: number; value: string; onChange: (id: string, name: string) => void; required?: boolean
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const dq = useDebounce(q, 280)
  const qc = useQueryClient()

  const { data: results, isFetching } = useQuery<Customer[]>({
    queryKey: ['customer-search', bid, dq],
    queryFn: async () => {
      const r = await api.get('/customers', { params: { business_id: bid, search: dq, per_page: 10 } })
      return r.data.data ?? r.data
    },
    enabled: !!bid && dq.length > 0,
  })

  const createMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/customers', p),
    onSuccess: (res) => {
      const c: Customer = res.data?.data ?? res.data
      qc.invalidateQueries({ queryKey: ['customers', bid] })
      onChange(String(c.id), c.name)
      setLabel(c.name)
      setQ(c.name)
      setOpen(false)
      setShowCreate(false)
      setNewName(''); setNewPhone('')
    },
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const select = (c: Customer) => {
    onChange(String(c.id), c.name)
    setLabel(c.name)
    setQ(c.name)
    setOpen(false)
  }
  const clear = () => { onChange('', ''); setLabel(''); setQ(''); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setLabel(''); onChange('', ''); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Rechercher un client…"
            data-sale-customer-input
            className="w-full px-3 py-2.5 pr-8 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet transition-all"
          />
          {value && (
            <button type="button" onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          {isFetching && !value && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-zinc-300 border-t-emi-violet rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          title="Nouveau client"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-emi-violet hover:border-emi-violet/40 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (results?.length ?? 0) > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl">
          {results!.map((c) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={() => select(c)}
              className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 text-emi-violet flex items-center justify-center text-xs font-bold shrink-0">
                {c.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{c.name}</p>
                {c.phone && <p className="text-xs text-zinc-400 truncate">{c.phone}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && dq.length > 0 && results?.length === 0 && !isFetching && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl px-3 py-3">
          <p className="text-xs text-zinc-400 text-center">Aucun client trouvé</p>
        </div>
      )}

      {/* Inline create */}
      {showCreate && (
        <div className="mt-2 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">Nouveau client</p>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom *"
            className="w-full px-3 py-2 rounded-lg text-sm border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30"
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Téléphone (optionnel)"
            className="w-full px-3 py-2 rounded-lg text-sm border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30"
          />
          <div className="flex gap-2">
            <Button
              type="button" size="sm" className="flex-1"
              loading={createMutation.isPending}
              disabled={!newName.trim()}
              onClick={() => createMutation.mutate({ businessId: bid, name: newName.trim(), phone: newPhone.trim() || undefined })}
            >Créer</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setShowCreate(false); setNewName(''); setNewPhone('') }}>
              Annuler
            </Button>
          </div>
        </div>
      )}
      {/* Hidden input to trigger browser required validation */}
      {required && <input tabIndex={-1} required value={value} onChange={() => {}} className="sr-only" />}
      {label && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>{label}</p>}
    </div>
  )
}

/* ─── Product Search ───────────────────────────────────────────────────── */
function ProductSearch({
  bid: _bid, cur, stockItems, onAdd,
}: {
  bid: number; cur: string; stockItems: StockItem[]; onAdd: (item: StockItem) => void
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = q.length > 0
    ? stockItems.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) && s.quantity > 0).slice(0, 6)
    : stockItems.filter(s => s.quantity > 0).slice(0, 6)

  const add = (item: StockItem) => { onAdd(item); setQ(''); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet transition-all"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => add(s)}
              className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-3 transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                <p className="text-xs text-zinc-400">{s.quantity} en stock · {s.sku || ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-emi-violet">{fmt(s.sellingPrice ?? 0, cur)}</p>
                <p className="text-xs text-zinc-400 group-hover:text-emi-violet transition-colors">+ Ajouter</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Cart Row ─────────────────────────────────────────────────────────── */
function CartRow({ item, index, cur, onUpdate, onRemove }: {
  item: CartItem; index: number; cur: string
  onUpdate: (i: number, f: keyof CartItem, v: string | number) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.name}</p>
        <p className="text-xs text-zinc-400">{fmt(item.unitPrice, cur)} / unité</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => item.quantity > 0.001 ? onUpdate(index, 'quantity', Math.max(0.001, item.quantity - 1)) : onRemove(index)}
          className="w-6 h-6 rounded-md bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors text-sm font-bold leading-none"
        >−</button>
        <input
          type="number"
          min={0.001}
          step="any"
          value={item.quantity}
          onChange={(e) => onUpdate(index, 'quantity', Math.max(0.001, Number(e.target.value)))}
          className="w-9 text-center text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-transparent border-0 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onUpdate(index, 'quantity', item.quantity + 1)}
          className="w-6 h-6 rounded-md bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:border-emi-violet hover:text-emi-violet transition-colors text-sm font-bold leading-none"
        >+</button>
      </div>
      <div className="w-20 text-right shrink-0">
        <input
          type="number"
          min={0}
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => onUpdate(index, 'unitPrice', Number(e.target.value))}
          className="w-full text-right text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-emi-violet/30 rounded px-1"
        />
      </div>
      <button type="button" onClick={() => onRemove(index)} className="text-zinc-300 hover:text-red-500 transition-colors ml-1">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  )
}

/* ─── Sale Card ────────────────────────────────────────────────────────── */
function SaleCard({ s, cur, paymentPanelId, openPaymentPanel, closePaymentPanel, addPaymentMutation, payAmount, setPayAmount, payMethod, setPayMethod, payDate, setPayDate, payNotes, setPayNotes, onDelete }: {
  s: Sale; cur: string; paymentPanelId: number | null
  openPaymentPanel: (s: Sale) => void; closePaymentPanel: () => void
  addPaymentMutation: { isPending: boolean; mutate: (p: Record<string, unknown>) => void }
  payAmount: string; setPayAmount: (v: string) => void
  payMethod: string; setPayMethod: (v: string) => void
  payDate: string; setPayDate: (v: string) => void
  payNotes: string; setPayNotes: (v: string) => void
  onDelete: (id: number) => void
}) {
  const actualPaid = s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? Number(s.paidAmount)
  const remaining = Number(s.totalAmount) - actualPaid
  const paidPct = s.totalAmount > 0 ? Math.min(100, Math.round((actualPaid / Number(s.totalAmount)) * 100)) : 0
  const isPending = s.type === 'credit' && s.status !== 'completed'
  const isOpen = paymentPanelId === s.id

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all ${isOpen ? 'border-emi-violet/40 shadow-md shadow-emi-violet/5' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{s.reference}</span>
            <Badge variant={s.type === 'cash' ? 'success' : 'info'} dot>{s.type}</Badge>
            <Badge variant={s.status === 'completed' ? 'success' : 'warning'} dot>{s.status}</Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{s.customer?.name || 'Client de passage'}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{String(s.date).slice(0, 10)} · {s.items?.length ?? 0} article{(s.items?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{fmt(Number(s.totalAmount), cur)}</p>
          {isPending && <p className="text-xs text-red-500 font-medium mt-0.5">−{fmt(remaining, cur)}</p>}
        </div>
      </div>

      {isPending && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>{fmt(actualPaid, cur)} payé</span>
            <span>{paidPct}%</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
            <div className="bg-emi-violet h-1.5 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 pb-4">
        {isPending && (
          <Button size="sm" variant={isOpen ? 'outline' : 'primary'} onClick={() => isOpen ? closePaymentPanel() : openPaymentPanel(s)}>
            {isOpen ? 'Fermer' : '💳 Encaisser'}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(s.id)}>
          Supprimer
        </Button>
      </div>

      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 space-y-3 bg-violet-50/30 dark:bg-violet-950/10 rounded-b-2xl">
          {s.payments && s.payments.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Historique</p>
              {s.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{String(p.date).slice(0, 10)}</span>
                    <Badge variant="info">{p.paymentMethod?.replace('_', ' ')}</Badge>
                  </div>
                  <span className="font-semibold text-emerald-600">+{fmt(Number(p.amount), cur)}</span>
                </div>
              ))}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Ajouter un versement</p>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" step="0.01" placeholder="Montant" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} min={0.01} />
              <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} options={[
                { value: 'cash', label: '💵 Cash' },
                { value: 'transfer', label: '🏦 Virement' },
                { value: 'mobile_money', label: '📱 Mobile Money' },
              ]} />
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              <Input placeholder="Notes (optionnel)" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
            </div>
            <Button
              type="button" size="sm" className="mt-2"
              loading={addPaymentMutation.isPending}
              disabled={!payAmount || Number(payAmount) <= 0}
              onClick={() => addPaymentMutation.mutate({ saleId: s.id, amount: Number(payAmount), paymentMethod: payMethod, date: payDate, notes: payNotes || undefined })}
            >
              Enregistrer le paiement
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export function SalesPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  // Form state
  const [type, setType] = useState<'cash' | 'credit'>('cash')
  const [customerId, setCustomerId] = useState('')
  const [_customerName, setCustomerName] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<CartItem[]>([])
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  // Manual item
  const [showManual, setShowManual] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [manualQty, setManualQty] = useState('1')

  // History state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [inputValue, setInputValue] = useState(search)
  useEffect(() => setInputValue(search), [search])

  // Auto-focus form when navigated from dashboard quick action
  useEffect(() => {
    if (searchParams.get('action') === 'new-sale') {
      setHistoryOpen(false)
      setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('action'); return n }, { replace: true })
      // Focus the customer search field after the DOM settles
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('[data-sale-customer-input]')
        input?.focus()
      }, 150)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Payment panel
  const [paymentPanelId, setPaymentPanelId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payDate, setPayDate] = useState(today)
  const [payNotes, setPayNotes] = useState('')

  // Queries
  const { data, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', bid, search, page],
    queryFn: async () => (await api.get('/sales', { params: { business_id: bid, search, page } })).data,
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/sales', p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales', bid], refetchType: 'all' })
      qc.invalidateQueries({ queryKey: ['dashboard', bid] })
      qc.invalidateQueries({ queryKey: ['stock-items', bid] })
      resetForm()
      setFormSuccess(true)
      setTimeout(() => setFormSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } }
      setFormError(e.response?.data?.error || e.response?.data?.errors?.[0]?.message || 'Erreur lors de la création.')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/sales/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales', bid] }); qc.invalidateQueries({ queryKey: ['dashboard', bid] }) },
  })
  const addPaymentMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => api.post('/sales/payments', p),
    onSuccess: () => { qc.refetchQueries({ queryKey: ['sales', bid] }); qc.invalidateQueries({ queryKey: ['dashboard', bid] }); setPayAmount(''); setPayNotes('') },
  })

  const resetForm = () => {
    setType('cash'); setCustomerId(''); setCustomerName(''); setDate(today)
    setNotes(''); setItems([]); setFormError('')
    setShowManual(false); setManualName(''); setManualPrice(''); setManualQty('1')
  }

  const addToCart = (s: StockItem) => setItems(prev => {
    const idx = prev.findIndex(i => i.stockItemId === s.id)
    if (idx >= 0) return prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it)
    return [...prev, { stockItemId: s.id, name: s.name, quantity: 1, unitPrice: s.sellingPrice ?? 0 }]
  })

  const addManualItem = () => {
    if (!manualName.trim() || !manualPrice) return
    setItems(prev => [...prev, { name: manualName.trim(), quantity: Number(manualQty) || 1, unitPrice: Number(manualPrice) }])
    setManualName(''); setManualPrice(''); setManualQty('1'); setShowManual(false)
  }

  const updateItem = (i: number, f: keyof CartItem, v: string | number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [f]: v } : it))
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (items.length === 0) { setFormError('Ajoutez au moins un article.'); return }
    if (type === 'credit' && !customerId) { setFormError('Un client est requis pour une vente à crédit.'); return }
    createMutation.mutate({
      businessId: bid, type,
      customerId: customerId ? Number(customerId) : undefined,
      date: date || today, notes: notes || undefined,
      items: items.map(it => ({ stockItemId: it.stockItemId, name: it.name, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
    })
  }

  const openPaymentPanel = (s: Sale) => {
    const remaining = Number(s.totalAmount) - (s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? Number(s.paidAmount))
    setPaymentPanelId(s.id)
    setPayAmount(remaining > 0 ? String(Number(remaining.toFixed(2))) : '')
    setPayMethod('cash'); setPayDate(today); setPayNotes('')
  }

  const applySearch = (e: FormEvent) => {
    e.preventDefault()
    setSearchParams(prev => {
      const n = new URLSearchParams(prev)
      inputValue.trim() ? n.set('search', inputValue.trim()) : n.delete('search')
      n.set('page', '1'); return n
    })
  }

  const sales = data?.data ?? []
  const meta = data?.meta
  const todaySales = sales.filter(s => String(s.date).slice(0, 10) === today)
  const todayTotal = todaySales.reduce((s, sale) => s + Number(sale.totalAmount), 0)

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emi-green mb-4">
        <Icon name="sales" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500">Sélectionnez un business pour accéder aux ventes.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header + KPIs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Ventes</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 shadow-sm">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emi-green"><Icon name="trending-up" size={15} /></div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Aujourd'hui</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{fmt(todayTotal, cur)}</p>
            </div>
            <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800 mx-1" />
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Ventes</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{todaySales.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── POS Terminal (full width, 2-col inside on lg) ── */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Nouvelle vente
          </h2>
          <button type="button" onClick={resetForm} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            Vider
          </button>
        </div>

        {/* 2-column body on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
          {/* LEFT: inputs */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">

            {/* ── Étape 1 : Type de paiement ── */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type de paiement</p>
              </div>
              <button
                type="button"
                onClick={() => { setType('cash'); setCustomerId(''); setCustomerName('') }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border-2 text-left transition-all duration-150 active:scale-[.98] ${
                  type === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <span className="text-base shrink-0">💵</span>
                <span className={`flex-1 text-sm font-semibold ${type === 'cash' ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                  Le client paye cash
                </span>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  type === 'cash' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {type === 'cash' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border-2 text-left transition-all duration-150 active:scale-[.98] ${
                  type === 'credit'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <span className="text-base shrink-0">🤝</span>
                <span className={`flex-1 text-sm font-semibold ${type === 'credit' ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                  Le client prend une dette
                </span>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  type === 'credit' ? 'border-amber-500 bg-amber-500' : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {type === 'credit' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            {/* ── Étape 2 : Client ── */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Client
                  {type === 'credit' && <span className="text-red-500 ml-1">*</span>}
                  {type === 'cash' && <span className="text-zinc-400 normal-case font-normal ml-1">· optionnel</span>}
                </p>
              </div>
              <CustomerCombobox bid={bid} value={customerId} onChange={(id, name) => { setCustomerId(id); setCustomerName(name) }} required={type === 'credit'} />
            </div>

            {/* ── Étape 3 : Produits ── */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Produits</p>
              </div>
              <ProductSearch bid={bid} cur={cur} stockItems={stockItems} onAdd={addToCart} />
              {stockItems.filter(s => s.quantity > 0).slice(0, 5).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {stockItems.filter(s => s.quantity > 0).slice(0, 5).map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => addToCart(s)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emi-violet hover:text-white text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-all active:scale-95"
                    >
                      <span>+</span> {s.name}
                      <span className="opacity-50 text-[10px]">{s.quantity}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Autres détails + article libre + erreurs ── */}
            <div className="p-5 space-y-3">
              <button
                type="button"
                onClick={() => setShowDetails(v => !v)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  className={`transition-transform duration-200 ${showDetails ? 'rotate-0' : '-rotate-90'}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
                Autres détails
              </button>
              {showDetails && (
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optionnel" />
                </div>
              )}
              {!showManual ? (
                <button type="button" onClick={() => setShowManual(true)} className="text-xs text-zinc-400 hover:text-emi-violet transition-colors flex items-center gap-1">
                  <Icon name="plus" size={12} /> Ajouter un article libre
                </button>
              ) : (
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
                  <div className="flex gap-2">
                    <Button type="button" size="sm" className="flex-1" onClick={addManualItem} disabled={!manualName.trim() || !manualPrice}>Ajouter</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowManual(false)}>Annuler</Button>
                  </div>
                </div>
              )}
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-600 dark:text-red-400">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                  Vente enregistrée avec succès !
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: cart + total + submit */}
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Panier</p>
            {items.length > 0 ? (
              <div className="space-y-2 flex-1">
                {items.map((it, i) => (
                  <CartRow key={i} item={it} index={i} cur={cur} onUpdate={updateItem} onRemove={removeItem} />
                ))}
              </div>
            ) : (
              <div className="flex-1 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl py-10 text-center flex items-center justify-center">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2">
                    <Icon name="sales" size={20} className="text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-xs text-zinc-400">Panier vide<br />Ajoutez des produits</p>
                </div>
              </div>
            )}
            <div className={`rounded-2xl p-4 ${items.length > 0 ? 'bg-gradient-to-br from-emi-violet to-violet-500' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${items.length > 0 ? 'text-violet-100' : 'text-zinc-500'}`}>
                  {items.length} article{items.length > 1 ? 's' : ''}
                </span>
                <span className={`text-3xl font-black ${items.length > 0 ? 'text-white' : 'text-zinc-400'}`}>
                  {fmt(total, cur)}
                </span>
              </div>
              <button
                type="submit"
                disabled={items.length === 0 || createMutation.isPending || (type === 'credit' && !customerId)}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  items.length > 0
                    ? 'bg-white text-emi-violet hover:bg-violet-50 shadow-lg shadow-violet-900/20'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                }`}
              >
                {createMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-emi-violet/30 border-t-emi-violet rounded-full animate-spin" />
                    Enregistrement…
                  </span>
                ) : `Valider la vente · ${fmt(total, cur)}`}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Sales History (collapsible card) ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setHistoryOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={`transition-transform duration-200 ${historyOpen ? 'rotate-0' : '-rotate-90'}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
            Historique des ventes
            {meta && <span className="text-xs font-normal text-zinc-400 ml-0.5">· {meta.total}</span>}
          </button>
          {historyOpen && (
            <div className="flex items-center gap-2">
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
                <button onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  Cartes
                </button>
                <button onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  Tableau
                </button>
              </div>
              <form onSubmit={applySearch} className="flex gap-1.5">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Rechercher…"
                    className="w-44 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet transition-all" />
                </div>
                <Button type="submit" size="sm" variant="secondary">OK</Button>
              </form>
            </div>
          )}
        </div>

        {historyOpen && (
          isLoading ? <div className="p-8"><Loader /></div> :
          <div className="p-5 space-y-3">
            {viewMode === 'cards' && (
              <>
                {sales.length ? sales.map((s) => (
                  <SaleCard
                    key={s.id} s={s} cur={cur}
                    paymentPanelId={paymentPanelId}
                    openPaymentPanel={openPaymentPanel}
                    closePaymentPanel={() => setPaymentPanelId(null)}
                    addPaymentMutation={addPaymentMutation}
                    payAmount={payAmount} setPayAmount={setPayAmount}
                    payMethod={payMethod} setPayMethod={setPayMethod}
                    payDate={payDate} setPayDate={setPayDate}
                    payNotes={payNotes} setPayNotes={setPayNotes}
                    onDelete={(id) => window.confirm('Supprimer cette vente ?') && deleteMutation.mutate(id)}
                  />
                )) : (
                  <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emi-green mb-3">
                      <Icon name="sales" size={22} />
                    </div>
                    <p className="text-sm text-zinc-400">{search ? 'Aucune vente ne correspond.' : 'Aucune vente pour le moment.'}</p>
                  </div>
                )}
                {meta && meta.lastPage > 1 && (
                  <Pagination meta={meta} onPageChange={(p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })} />
                )}
              </>
            )}
            {viewMode === 'table' && (
              <div className="overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <tr>
                        {['Référence','Type','Client','Total','Statut','Date',''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                      {sales.length ? sales.map((s) => {
                        const actualPaid = s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? Number(s.paidAmount)
                        const remaining = Number(s.totalAmount) - actualPaid
                        const isPending = s.type === 'credit' && s.status !== 'completed'
                        const isOpen = paymentPanelId === s.id
                        return (
                          <Fragment key={s.id}>
                            <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{s.reference}</td>
                              <td className="px-4 py-3"><Badge variant={s.type === 'cash' ? 'success' : 'info'} dot>{s.type}</Badge></td>
                              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{s.customer?.name || 'Passage'}</td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fmt(Number(s.totalAmount), cur)}</span>
                                {isPending && <p className="text-xs text-red-500">{fmt(remaining, cur)} restant</p>}
                              </td>
                              <td className="px-4 py-3"><Badge variant={s.status === 'completed' ? 'success' : 'warning'} dot>{s.status}</Badge></td>
                              <td className="px-4 py-3 text-zinc-400 text-xs">{String(s.date).slice(0, 10)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 justify-end">
                                  {isPending && (
                                    <Button size="sm" variant={isOpen ? 'outline' : 'primary'} onClick={() => isOpen ? setPaymentPanelId(null) : openPaymentPanel(s)}>
                                      {isOpen ? 'Fermer' : 'Payer'}
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => window.confirm('Supprimer ?') && deleteMutation.mutate(s.id)}>×</Button>
                                </div>
                              </td>
                            </tr>
                            {isOpen && (
                              <tr className="bg-violet-50/30 dark:bg-violet-950/10">
                                <td colSpan={7} className="px-4 py-3">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                                    <Input type="number" step="0.01" placeholder="Montant" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                                    <Select value={payMethod} onChange={e => setPayMethod(e.target.value)} options={[{value:'cash',label:'Cash'},{value:'transfer',label:'Virement'},{value:'mobile_money',label:'Mobile Money'}]} />
                                    <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
                                    <Button loading={addPaymentMutation.isPending} disabled={!payAmount || Number(payAmount) <= 0}
                                      onClick={() => addPaymentMutation.mutate({ saleId: s.id, amount: Number(payAmount), paymentMethod: payMethod, date: payDate, notes: payNotes || undefined })}>
                                      Enregistrer
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      }) : (
                        <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                          {search ? 'Aucune vente ne correspond.' : 'Aucune vente pour le moment.'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {meta && <Pagination meta={meta} onPageChange={(p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
