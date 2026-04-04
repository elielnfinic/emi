import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
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
import type { Transaction, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

export function TransactionsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successType, setSuccessType] = useState<'income' | 'expense'>('income')

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

  const { data, isLoading } = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', bid, search, page, typeFilter],
    queryFn: async () =>
      (await api.get('/transactions', { params: { business_id: bid, search, page, type: typeFilter || undefined } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      setSuccessType(type as 'income' | 'expense')
      resetForm()
      setShowModal(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
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
      {/* Success toast */}
      {showSuccess && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 text-white px-5 py-3 rounded-2xl shadow-xl animate-fade-in ${successType === 'income' ? 'bg-emi-green' : 'bg-red-500'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          <span className="font-medium text-sm">
            {successType === 'income' ? 'Entrée enregistrée !' : 'Dépense enregistrée !'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Transactions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentBusiness?.name} · {meta?.total ?? transactions.length} transaction{(meta?.total ?? transactions.length) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setType('income'); setShowModal(true) }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
          >
            <Icon name="arrow-up" size={14} /> Entrée d'argent
          </button>
          <button
            onClick={() => { resetForm(); setType('expense'); setShowModal(true) }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm"
          >
            <Icon name="arrow-down" size={14} /> Dépense
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard title="Revenus" value={fmt(totalIncome, cur)} color="green" icon={<Icon name="arrow-up" size={18} />} />
        <StatCard title="Dépenses" value={fmt(totalExpense, cur)} color="red" icon={<Icon name="arrow-down" size={18} />} />
        <StatCard title="Net" value={fmt(totalIncome - totalExpense, cur)} color={totalIncome >= totalExpense ? 'violet' : 'red'} icon={<Icon name="wallet" size={18} />} />
      </div>

      {/* Search + filter */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
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

        {/* List */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800">
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
                  {tx.description || tx.reference}
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

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
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
          <Input label="Bénéficiaire" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="Nom du bénéficiaire" />
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending} disabled={!amount || Number(amount) <= 0}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
