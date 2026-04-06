import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { StatCard } from '../components/ui/Card'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Transaction, PaginatedResponse } from '../types'

/* ─── BeneficiaryAutocomplete ──────────────────────────────────── */

interface BeneficiaryMeta { total: number; perPage: number; currentPage: number; lastPage: number }
interface BeneficiaryResult { data: string[]; meta: BeneficiaryMeta }

function BeneficiaryAutocomplete({
  value, onChange, businessId,
}: {
  value: string
  onChange: (v: string) => void
  businessId: number | undefined
}) {
  const [open, setOpen] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const prevSearchRef = useRef('')

  const { data, isFetching } = useQuery<BeneficiaryResult>({
    queryKey: ['tx-beneficiaries', businessId, debouncedSearch, page],
    queryFn: async () =>
      (await api.get('/transactions/beneficiaries', {
        params: { business_id: businessId, search: debouncedSearch, page, per_page: 12 },
      })).data,
    enabled: !!businessId && open,
    staleTime: 30_000,
  })

  // Accumulate pages; reset when search changes
  useEffect(() => {
    if (!data?.data) return
    if (debouncedSearch !== prevSearchRef.current || page === 1) {
      setAccumulated(data.data)
      prevSearchRef.current = debouncedSearch
    } else {
      setAccumulated(prev => {
        const next = [...prev]
        data.data.forEach(b => { if (!next.includes(b)) next.push(b) })
        return next
      })
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // Click-outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange(v)
    setOpen(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(v)
      setPage(1)
      setAccumulated([])
    }, 280)
  }

  const handleSelect = (b: string) => {
    onChange(b)
    setOpen(false)
  }

  const loadMore = () => setPage(p => p + 1)
  const hasMore = !!data?.meta && data.meta.currentPage < data.meta.lastPage

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Label */}
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
        Bénéficiaire
      </label>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder="Nom du bénéficiaire"
        autoComplete="off"
        className="w-full px-3 py-2.5 rounded-lg text-sm border transition-all duration-150 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet border-zinc-200 dark:border-zinc-700"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 flex flex-col">
          <div className="overflow-y-auto flex-1">
            {accumulated.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {accumulated.map(b => (
                  <button
                    key={b}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); handleSelect(b) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-emi-violet transition-colors text-left"
                  >
                    <Icon name="users" size={12} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                    <span className="truncate">{b}</span>
                  </button>
                ))}
              </div>
            ) : !isFetching ? (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-zinc-400">
                  {debouncedSearch ? `Aucun résultat pour "${debouncedSearch}"` : 'Aucun bénéficiaire enregistré'}
                </p>
              </div>
            ) : null}

            {isFetching && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-zinc-400">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Chargement…
              </div>
            )}
          </div>

          {/* Load more */}
          {hasMore && !isFetching && (
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); loadMore() }}
              className="flex items-center justify-center gap-1.5 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-xs font-medium text-emi-violet hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
            >
              <Icon name="arrow-down" size={11} />
              Charger plus ({data.meta.total - accumulated.length} restants)
            </button>
          )}

          {/* Footer count */}
          {accumulated.length > 0 && data?.meta && (
            <div className="px-4 py-1.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-[10px] text-zinc-400">
                {accumulated.length} sur {data.meta.total} bénéficiaire{data.meta.total !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

export function TransactionsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [successType, setSuccessType] = useState<'income' | 'expense'>('income')
  const [inModalSuccess, setInModalSuccess] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)

  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const typeFilter = searchParams.get('type') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [inputValue, setInputValue] = useState(search)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setInputValue(search) }, [search])

  // Auto-open modal when navigated from dashboard quick action
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'income' || action === 'expense') {
      setType(action)
      setAmount(''); setDescription(''); setBeneficiary('')
      setDate(new Date().toISOString().split('T')[0])
      setShowModal(true)
      setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('action'); return n }, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading } = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', bid, search, page, typeFilter],
    queryFn: async () =>
      (await api.get('/transactions', { params: { business_id: bid, search, page, type: typeFilter || undefined } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/transactions', payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      // Read type from the mutation variables — never stale
      setSuccessType(variables.type as 'income' | 'expense')
      // Reset only amount / description / beneficiary — keep date and type
      setAmount(''); setDescription(''); setBeneficiary('')
      setInModalSuccess(true)
      setTimeout(() => setInModalSuccess(false), 3500)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
    },
  })

  const resetForm = () => {
    setType('income'); setAmount(''); setDescription(''); setBeneficiary('')
    setDate(new Date().toISOString().split('T')[0])
    setInModalSuccess(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid, type, amount: Number(amount),
      description: description || undefined,
      beneficiary: beneficiary || undefined,
      date: date || undefined,
    })
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
      next.delete('search'); next.set('page', '1')
      return next
    })
    searchRef.current?.focus()
  }

  const setTypeFilter = (t: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (t) next.set('type', t)
      else next.delete('type')
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-5">
        <Icon name="arrow-up-down" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un business pour voir les transactions.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const transactions = data?.data ?? []
  const meta = data?.meta
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Transactions</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {currentBusiness?.name} · {meta?.total ?? transactions.length} transaction{(meta?.total ?? transactions.length) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Action list */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {/* Expense row */}
        <button
          type="button"
          onClick={() => { resetForm(); setType('expense'); setShowModal(true) }}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50/40 dark:hover:bg-red-950/10 transition-colors group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-950/60 transition-colors">
            <Icon name="arrow-down" size={20} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Enregistrer une dépense</p>
            <p className="text-xs text-zinc-400 mt-0.5">Loyer, fournitures, salaires, charges…</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-red-600 transition-colors">
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          </div>
        </button>

        {/* Income row */}
        <button
          type="button"
          onClick={() => { resetForm(); setType('income'); setShowModal(true) }}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10 transition-colors group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-950/60 transition-colors">
            <Icon name="arrow-up" size={20} className="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Enregistrer une entrée</p>
            <p className="text-xs text-zinc-400 mt-0.5">Virement reçu, paiement client, remboursement…</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-emerald-600 transition-colors">
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          </div>
        </button>
      </div>

      {/* Collapsible: stats + history */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Collapsible header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setStatsOpen(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={`transition-transform duration-200 ${statsOpen ? 'rotate-0' : '-rotate-90'}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
            Statistiques & historique
            {meta && <span className="text-xs font-normal text-zinc-400 ml-0.5">· {meta.total}</span>}
          </button>
        </div>

        {statsOpen && (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
              <StatCard title="Revenus" value={fmt(totalIncome, cur)} color="green" icon={<Icon name="arrow-up" size={18} />} />
              <StatCard title="Dépenses" value={fmt(totalExpense, cur)} color="red" icon={<Icon name="arrow-down" size={18} />} />
              <StatCard title="Net" value={fmt(totalIncome - totalExpense, cur)} color={totalIncome >= totalExpense ? 'violet' : 'red'} icon={<Icon name="wallet" size={18} />} />
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-2 p-3">
              <div className="relative flex-1">
                <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Rechercher par référence, description ou bénéficiaire…"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applySearch()}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emi-violet focus:ring-1 focus:ring-emi-violet/30 transition"
                />
                {inputValue && (
                  <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>

              {/* Type filter */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                {(['', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      typeFilter === t
                        ? t === 'income' ? 'bg-emerald-500 text-white' : t === 'expense' ? 'bg-red-500 text-white' : 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-700 dark:text-zinc-200'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    {t === '' ? 'Tous' : t === 'income' ? 'Revenus' : 'Dépenses'}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction list */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.length ? transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  {/* Icon bubble */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emi-green'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-500'
                  }`}>
                    <Icon name={tx.type === 'income' ? 'arrow-up' : 'arrow-down'} size={14} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {tx.description?.startsWith('stock_movement:')
                        ? 'Achat de stock'
                        : tx.description?.startsWith('sale:')
                          ? 'Vente enregistrée'
                          : tx.description || tx.reference}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-zinc-400">{tx.date}</p>
                      {tx.beneficiary && <span className="text-xs text-zinc-400 truncate">· {tx.beneficiary}</span>}
                      {tx.category && <Badge variant="info">{tx.category.name}</Badge>}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emi-green' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '−'}{fmt(Number(tx.amount), cur)}
                    </p>
                    <p className="text-xs text-zinc-400">{tx.reference}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => { if (window.confirm('Supprimer cette transaction ?')) deleteMutation.mutate(tx.id) }}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              )) : (
                <div className="py-14 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-3">
                    <Icon name="arrow-up-down" size={22} />
                  </div>
                  <p className="text-sm text-zinc-400">
                    {search ? 'Aucune transaction ne correspond.' : 'Aucune transaction. Ajoutez votre première transaction.'}
                  </p>
                  {!search && (
                    <button onClick={() => { resetForm(); setShowModal(true) }} className="mt-2 text-sm text-emi-violet hover:underline">
                      + Ajouter une transaction
                    </button>
                  )}
                </div>
              )}
            </div>

            {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title={type === 'income' ? '💰 Entrée d\'argent' : '💸 Enregistrer une dépense'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Type toggle */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              Revenu
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              Dépense
            </button>
          </div>
          <Input label="Montant *" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" />
          <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Loyer, salaire, etc." />
          <BeneficiaryAutocomplete value={beneficiary} onChange={setBeneficiary} businessId={bid} />
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

          {/* ── Success banner — juste au-dessus des boutons ── */}
          {inModalSuccess && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border animate-fade-in
              ${successType === 'income'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'}`}>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-white ${successType === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span>
                {successType === 'income' ? 'Entrée enregistrée avec succès !' : 'Dépense enregistrée avec succès !'}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm() }} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending} disabled={!amount || Number(amount) <= 0}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
