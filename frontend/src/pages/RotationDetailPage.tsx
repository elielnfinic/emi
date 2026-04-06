import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { RotationDetail } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function daysBetween(a: string, b?: string | null) {
  const end = b ? new Date(b) : new Date()
  const start = new Date(a)
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86_400_000))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

type Tab = 'transactions' | 'ventes' | 'resume'

export function RotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentBusiness } = useAppStore()
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('transactions')

  const { data: rotation, isLoading } = useQuery<RotationDetail>({
    queryKey: ['rotation', id],
    queryFn: async () => (await api.get(`/rotations/${id}`)).data,
    enabled: !!id,
  })

  const closeMutation = useMutation({
    mutationFn: () => api.post(`/rotations/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotation', id] })
      queryClient.invalidateQueries({ queryKey: ['rotations'] })
    },
  })

  if (isLoading) return <Loader />
  if (!rotation) return (
    <div className="text-center py-20">
      <p className="text-zinc-400">Rotation introuvable.</p>
      <button onClick={() => navigate('/rotations')} className="mt-2 text-sm text-emi-violet hover:underline">
        ← Retour aux rotations
      </button>
    </div>
  )

  const transactions = rotation.transactions ?? []
  const sales = rotation.sales ?? []

  const expenses = transactions.filter(t => t.type === 'expense')
  const incomes = transactions.filter(t => t.type === 'income')

  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0)
  const totalSales = sales.reduce((s, s2) => s + Number(s2.totalAmount), 0)
  const totalRevenue = totalSales + totalIncome
  const profit = totalRevenue - totalExpenses
  const initialCapital = Number(rotation.initialCapital)
  const roi = initialCapital > 0 ? Math.round((profit / initialCapital) * 100) : null
  const isActive = rotation.status === 'active'
  const days = daysBetween(rotation.startDate, rotation.endDate)


  return (
    <div className="space-y-5">
      {/* Back breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <button onClick={() => navigate('/rotations')} className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center gap-1">
          <Icon name="rotations" size={14} />
          Rotations
        </button>
        <Icon name="chevron-right" size={14} />
        <span className="text-zinc-700 dark:text-zinc-200 font-medium truncate">{rotation.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
              <Icon name="rotations" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{rotation.name}</h1>
                <Badge variant={isActive ? 'success' : 'default'} dot>
                  {isActive ? 'Active' : 'Clôturée'}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                {fmtDate(rotation.startDate)}
                {rotation.endDate ? ` → ${fmtDate(rotation.endDate)}` : ' · en cours'}
                {' · '}<span className="font-medium text-zinc-600 dark:text-zinc-300">{days} jour{days !== 1 ? 's' : ''}</span>
              </p>
              {rotation.notes && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 italic">{rotation.notes}</p>
              )}
            </div>
          </div>
          {isActive && (
            <Button
              size="sm"
              variant="secondary"
              loading={closeMutation.isPending}
              onClick={() => { if (window.confirm('Clôturer cette rotation ? Cette action est irréversible.')) closeMutation.mutate() }}
            >
              Clôturer la rotation
            </Button>
          )}
        </div>
      </div>

      {/* Lifecycle flow */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Step 1: Capital */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-emi-violet flex items-center justify-center">
              <span className="text-xs font-bold">1</span>
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Investi</p>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{fmt(initialCapital, cur)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Capital initial</p>
        </div>

        {/* Step 2: Dépenses */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center">
              <span className="text-xs font-bold">2</span>
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Achats & frais</p>
          </div>
          <p className="text-lg font-bold text-red-500">{fmt(totalExpenses, cur)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{expenses.length} opération{expenses.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Step 3: Ventes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
              <span className="text-xs font-bold">3</span>
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Encaissé</p>
          </div>
          <p className="text-lg font-bold text-emerald-600">{fmt(totalRevenue, cur)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {sales.length} vente{sales.length !== 1 ? 's' : ''}
            {incomes.length > 0 && ` + ${incomes.length} entrée${incomes.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Step 4: Bénéfice */}
        <div className={`rounded-2xl border shadow-sm p-4 ${
          profit >= 0
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${profit >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700' : 'bg-red-100 dark:bg-red-900/40 text-red-600'}`}>
              <span className="text-xs font-bold">4</span>
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Bénéfice net</p>
          </div>
          <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}{fmt(profit, cur)}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {roi !== null ? `ROI ${roi >= 0 ? '+' : ''}${roi}%` : 'Capital non défini'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-2 pt-2 gap-1">
          {([
            { key: 'transactions', label: 'Transactions', count: transactions.length },
            { key: 'ventes', label: 'Ventes', count: sales.length },
            { key: 'resume', label: 'Résumé', count: null },
          ] as { key: Tab; label: string; count: number | null }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-emi-violet text-emi-violet bg-violet-50/50 dark:bg-violet-950/20'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-emi-violet text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TRANSACTIONS TAB ─── */}
        {tab === 'transactions' && (
          <div>
            {transactions.length === 0 ? (
              <div className="py-14 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
                  <Icon name="arrow-up-down" size={20} />
                </div>
                <p className="text-sm text-zinc-400">Aucune transaction liée à cette rotation.</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Lors de la création d'une transaction, sélectionnez cette rotation pour la lier.
                </p>
              </div>
            ) : (
              <>
                {/* Dépenses */}
                {expenses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
                        <Icon name="arrow-down" size={11} />
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Achats & dépenses · {fmt(totalExpenses, cur)}
                      </span>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {expenses.map(tx => (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center shrink-0">
                            <Icon name="arrow-down" size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {tx.description || tx.reference}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-zinc-400">{fmtDate(tx.date)}</p>
                              {tx.beneficiary && <span className="text-xs text-zinc-400">· {tx.beneficiary}</span>}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-red-500 shrink-0">−{fmt(Number(tx.amount), cur)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revenus / entrées */}
                {incomes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 border-t border-t-zinc-100 dark:border-t-zinc-800">
                      <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <Icon name="arrow-up" size={11} />
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Autres revenus · {fmt(totalIncome, cur)}
                      </span>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {incomes.map(tx => (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center shrink-0">
                            <Icon name="arrow-up" size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {tx.description || tx.reference}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-zinc-400">{fmtDate(tx.date)}</p>
                              {tx.beneficiary && <span className="text-xs text-zinc-400">· {tx.beneficiary}</span>}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-emerald-600 shrink-0">+{fmt(Number(tx.amount), cur)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── VENTES TAB ─── */}
        {tab === 'ventes' && (
          <div>
            {sales.length === 0 ? (
              <div className="py-14 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
                  <Icon name="sales" size={20} />
                </div>
                <p className="text-sm text-zinc-400">Aucune vente liée à cette rotation.</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Lors de la création d'une vente, sélectionnez cette rotation pour la lier.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sales.map(sale => {
                  const isPaid = sale.status === 'paid' || Number(sale.paidAmount) >= Number(sale.totalAmount)
                  const paidPct = Number(sale.totalAmount) > 0
                    ? Math.min(100, Math.round((Number(sale.paidAmount) / Number(sale.totalAmount)) * 100))
                    : 100
                  return (
                    <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'}`}>
                        <Icon name={isPaid ? 'check' : 'debt'} size={13} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {sale.customer?.name || 'Client anonyme'}
                          </p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isPaid ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}>
                            {isPaid ? 'Payé' : `${paidPct}% payé`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-zinc-400">{fmtDate(sale.date)}</p>
                          <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
                          <p className="text-xs text-zinc-400 font-mono">{sale.reference}</p>
                        </div>
                        {!isPaid && (
                          <div className="mt-1.5 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden w-32">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${paidPct}%` }} />
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{fmt(Number(sale.totalAmount), cur)}</p>
                        {!isPaid && Number(sale.paidAmount) > 0 && (
                          <p className="text-xs text-zinc-400">{fmt(Number(sale.paidAmount), cur)} encaissé</p>
                        )}
                      </div>

                      {/* Link to sale detail */}
                      <Link
                        to={`/sales`}
                        className="shrink-0 p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-emi-violet hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                        title="Voir la vente"
                      >
                        <Icon name="chevron-right" size={14} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Sales total row */}
            {sales.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Total ventes</span>
                <span className="text-sm font-bold text-emerald-600">{fmt(totalSales, cur)}</span>
              </div>
            )}
          </div>
        )}

        {/* ─── RÉSUMÉ TAB ─── */}
        {tab === 'resume' && (
          <div className="p-5 space-y-4">
            {/* P&L table */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Compte de résultat</p>

              <div className="space-y-0 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                {/* Capital */}
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emi-violet" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Capital initial investi</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{fmt(initialCapital, cur)}</span>
                </div>

                {/* Expenses */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Achats & frais ({expenses.length})</span>
                  </div>
                  <span className="text-sm font-semibold text-red-500">−{fmt(totalExpenses, cur)}</span>
                </div>

                {/* Sales revenue */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Revenus des ventes ({sales.length})</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">+{fmt(totalSales, cur)}</span>
                </div>

                {/* Other income */}
                {totalIncome > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">Autres revenus ({incomes.length})</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">+{fmt(totalIncome, cur)}</span>
                  </div>
                )}

                {/* Net profit */}
                <div className={`flex items-center justify-between px-4 py-3.5 border-t-2 ${profit >= 0 ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'}`}>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Bénéfice net</span>
                  <span className={`text-base font-bold ${profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}{fmt(profit, cur)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ratios */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-400 mb-1">Taux de marge</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {totalRevenue > 0 ? `${Math.round((profit / totalRevenue) * 100)}%` : '—'}
                </p>
                <p className="text-xs text-zinc-400">bénéfice / ventes</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-400 mb-1">ROI</p>
                <p className={`text-lg font-bold ${roi !== null && roi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {roi !== null ? `${roi >= 0 ? '+' : ''}${roi}%` : '—'}
                </p>
                <p className="text-xs text-zinc-400">retour sur capital</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-400 mb-1">Durée</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{days} j</p>
                <p className="text-xs text-zinc-400">{isActive ? 'en cours' : 'durée totale'}</p>
              </div>
            </div>

            {/* Unpaid sales callout */}
            {(() => {
              const unpaid = sales.filter(s => s.status !== 'paid' && Number(s.paidAmount) < Number(s.totalAmount))
              const unpaidTotal = unpaid.reduce((sum, s) => sum + (Number(s.totalAmount) - Number(s.paidAmount)), 0)
              if (unpaid.length === 0) return null
              return (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <Icon name="alert" size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {unpaid.length} vente{unpaid.length !== 1 ? 's' : ''} non soldée{unpaid.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      {fmt(unpaidTotal, cur)} reste à encaisser — le bénéfice réel sera plus élevé une fois ces ventes soldées.
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
