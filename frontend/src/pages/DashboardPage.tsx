import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { StatCard } from '../components/ui/Card'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { useAppStore, useAuthStore, useThemeStore } from '../stores'
import api from '../services/api'
import type { DashboardData, Transaction, Rotation, Sale, PaginatedResponse } from '../types'

/* ─── helpers ──────────────────────────────────────────────────── */

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function daysBetween(a: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(a).getTime()) / 86_400_000))
}

function buildChartData(transactions: Transaction[]) {
  const byDate: Record<string, { income: number; expense: number }> = {}
  for (const tx of transactions) {
    const d = tx.date?.slice(0, 10) ?? 'N/A'
    if (!byDate[d]) byDate[d] = { income: 0, expense: 0 }
    if (tx.type === 'income') byDate[d].income += Number(tx.amount)
    else byDate[d].expense += Number(tx.amount)
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      Revenus: v.income,
      Dépenses: v.expense,
    }))
}

const CustomTooltip = ({ active, payload, label, currency }: {
  active?: boolean; payload?: { color: string; name: string; value: number }[]
  label?: string; currency: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-500">{p.name}:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fmt(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Action list ───────────────────────────────────────────────── */

interface ActionDef {
  key: string
  label: string
  desc: string
  icon: string
  bg: string
  fg: string
  href: string
}

function ActionList({ actions }: { actions: ActionDef[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {actions.map((a, i) => (
        <Link
          key={a.key}
          to={a.href}
          className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${a.bg} ${a.fg}`}>
            <Icon name="arrow-right" size={11} />
          </div>
          <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{a.label}</p>
          <p className="text-xs text-zinc-400 hidden sm:block">{a.desc}</p>
          <Icon name="chevron-right" size={13} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────── */

export function DashboardPage() {
  const { currentBusiness } = useAppStore()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const queryClient = useQueryClient()
  const isDark = theme === 'dark'

  const businessId = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const supportsRotations = currentBusiness?.supportsRotations ?? false

  /* roles */
  const globalRole = user?.role
  const bizRole = businessId ? user?.businessRoles?.[businessId] : undefined
  const effectiveRole = globalRole === 'superadmin' ? 'superadmin' : (bizRole ?? '')
  const isAdmin = effectiveRole === 'superadmin' || effectiveRole === 'admin'
  const isManager = isAdmin || effectiveRole === 'manager'
  const isCashier = effectiveRole === 'cashier'
  const isStock = effectiveRole === 'stock'
  const canSeeMoney = isManager

  /* greeting */
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = user?.fullName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? ''
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  /* queries */
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', businessId],
    queryFn: async () => (await api.get('/dashboard', { params: { business_id: businessId } })).data,
    enabled: !!businessId,
  })

  const { data: rotations } = useQuery<Rotation[]>({
    queryKey: ['rotations', businessId],
    queryFn: async () => (await api.get('/rotations', { params: { business_id: businessId } })).data,
    enabled: !!businessId && supportsRotations,
  })
  const activeRotation = rotations?.find(r => r.status === 'active') ?? null

  const { data: unpaidPage } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', businessId, 'dashboard-unpaid'],
    queryFn: async () =>
      (await api.get('/sales', { params: { business_id: businessId, type: 'credit', status: 'pending', per_page: 5 } })).data,
    enabled: !!businessId && (isManager || isCashier),
  })
  const unpaidSales = unpaidPage?.data ?? []
  const unpaidTotal = unpaidSales.reduce((s, sale) => s + (Number(sale.totalAmount) - Number(sale.paidAmount)), 0)

  const closeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/rotations/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotations', businessId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', businessId] })
    },
  })

  const chartData = useMemo(() => buildChartData(data?.recentTransactions ?? []), [data])
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const textColor = isDark ? '#71717a' : '#a1a1aa'

  /* ─── Empty state ─── */
  if (!businessId) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 mb-5">
        <img src="/icon.png" alt="EMI" className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Bienvenue sur EMI</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez ou créez un business pour commencer.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const k = data?.kpis

  /* ─── Quick actions per role ─── */
  const actions: ActionDef[] = []

  if (isManager || isCashier) {
    actions.push({
      key: 'new-sale', label: 'Nouvelle vente', desc: 'Comptant ou à crédit',
      icon: 'sales', bg: 'bg-emerald-50 dark:bg-emerald-950/30', fg: 'text-emerald-600',
      href: '/sales',
    })
    actions.push({
      key: 'pay-debt', label: 'Enregistrer un paiement', desc: 'Solder une dette client',
      icon: 'debt', bg: 'bg-amber-50 dark:bg-amber-950/30', fg: 'text-amber-500',
      href: '/unpaid-bills',
    })
  }

  if (isManager || isStock) {
    actions.push({
      key: 'stock-in', label: 'Arrivage de stock', desc: 'Enregistrer du stock entrant',
      icon: 'stock', bg: 'bg-blue-50 dark:bg-blue-950/30', fg: 'text-blue-500',
      href: '/stock',
    })
  }

  if (isManager) {
    actions.push({
      key: 'income', label: "Entrée d'argent", desc: 'Revenu, encaissement…',
      icon: 'arrow-up', bg: 'bg-emerald-50 dark:bg-emerald-950/30', fg: 'text-emerald-600',
      href: '/transactions',
    })
    actions.push({
      key: 'expense', label: 'Nouvelle dépense', desc: 'Frais, achats, charges…',
      icon: 'arrow-down', bg: 'bg-red-50 dark:bg-red-950/30', fg: 'text-red-500',
      href: '/transactions',
    })
    actions.push({
      key: 'reports', label: 'Rapports', desc: 'Analyses & statistiques',
      icon: 'reports', bg: 'bg-violet-50 dark:bg-violet-950/30', fg: 'text-emi-violet',
      href: '/reports',
    })
  }

  if (isStock) {
    actions.push({
      key: 'stock-view', label: 'État du stock', desc: 'Inventaire & niveaux',
      icon: 'bar-chart', bg: 'bg-violet-50 dark:bg-violet-950/30', fg: 'text-emi-violet',
      href: '/stock',
    })
  }

  if (isCashier) {
    actions.push({
      key: 'customers', label: 'Clients', desc: 'Gérer les fiches clients',
      icon: 'customers', bg: 'bg-violet-50 dark:bg-violet-950/30', fg: 'text-emi-violet',
      href: '/customers',
    })
  }

  /* ─── Render ─── */
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {greeting}{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">
          {currentBusiness?.name} · {todayStr}
        </p>
      </div>

      {/* ── Quick Actions ── */}
      {actions.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5 px-0.5">
            Actions rapides
          </p>
          <ActionList actions={actions} />
        </section>
      )}

      {/* ── Active Rotation Banner ── */}
      {supportsRotations && activeRotation && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Rotation en cours</p>
              <Badge variant="success">{activeRotation.name}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/rotations/${activeRotation.id}`}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Explorer <Icon name="chevron-right" size={12} />
              </Link>
              <Button
                size="sm"
                variant="secondary"
                loading={closeMutation.isPending}
                onClick={() => { if (window.confirm('Clôturer cette rotation ?')) closeMutation.mutate(activeRotation.id) }}
              >
                Clôturer
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-zinc-100 dark:divide-zinc-800">
            <div className="px-5 py-3.5">
              <p className="text-xs text-zinc-400 mb-1">Capital initial</p>
              <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{fmt(Number(activeRotation.initialCapital), cur)}</p>
            </div>
            <div className="px-5 py-3.5">
              <p className="text-xs text-zinc-400 mb-1">Démarrée le</p>
              <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {new Date(activeRotation.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <div className="px-5 py-3.5">
              <p className="text-xs text-zinc-400 mb-1">Durée</p>
              <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {daysBetween(activeRotation.startDate)} jour{daysBetween(activeRotation.startDate) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="px-5 py-3.5">
              <p className="text-xs text-zinc-400 mb-1">Notes</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{activeRotation.notes || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* No rotation prompt for managers */}
      {supportsRotations && !activeRotation && isManager && (
        <div className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet flex items-center justify-center shrink-0">
            <Icon name="rotations" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Aucune rotation active</p>
            <p className="text-xs text-zinc-400 mt-0.5">Commencez une nouvelle rotation pour suivre vos achats et ventes.</p>
          </div>
          <Link
            to="/rotations"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-emi-violet text-white hover:opacity-90 transition-opacity"
          >
            <Icon name="plus" size={13} /> Démarrer
          </Link>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {canSeeMoney && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Balance"
            value={fmt(k?.balance ?? 0, cur)}
            color="violet"
            icon={<Icon name="wallet" size={20} />}
          />
          <StatCard
            title="Ventes du jour"
            value={fmt(k?.todaySalesTotal ?? 0, cur)}
            subtitle={`${k?.todaySalesCount ?? 0} vente${(k?.todaySalesCount ?? 0) > 1 ? 's' : ''}`}
            color="green"
            icon={<Icon name="trending-up" size={20} />}
          />
          <StatCard
            title="Ventes du mois"
            value={fmt(k?.monthSalesTotal ?? 0, cur)}
            subtitle={`${k?.monthSalesCount ?? 0} ventes`}
            color="blue"
            icon={<Icon name="bar-chart" size={20} />}
          />
          <StatCard
            title="Stock bas"
            value={k?.lowStockCount ?? 0}
            subtitle="articles à réapprovisionner"
            color={(k?.lowStockCount ?? 0) > 0 ? 'red' : 'green'}
            icon={<Icon name="alert" size={20} />}
          />
        </div>
      )}

      {/* Stock low alert for stock manager (no money access) */}
      {isStock && !canSeeMoney && (k?.lowStockCount ?? 0) > 0 && (
        <Link
          to="/stock"
          className="flex items-center gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0">
            <Icon name="alert" size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {k?.lowStockCount} article{(k?.lowStockCount ?? 0) > 1 ? 's' : ''} en rupture ou stock bas
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Cliquez pour voir les articles à réapprovisionner</p>
          </div>
          <Icon name="chevron-right" size={16} className="text-amber-400" />
        </Link>
      )}

      {/* ── Unpaid Debts Widget ── */}
      {unpaidSales.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Dettes non soldées
              </p>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                {unpaidSales.length}
              </span>
            </div>
            <Link to="/unpaid-bills" className="text-xs text-emi-violet hover:underline flex items-center gap-1">
              Tout voir <Icon name="chevron-right" size={12} />
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Total bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Total à encaisser</p>
              <p className="text-base font-bold text-red-600 dark:text-red-400">{fmt(unpaidTotal, cur)}</p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {unpaidSales.map(sale => {
                const remaining = Number(sale.totalAmount) - Number(sale.paidAmount)
                const paidPct = Number(sale.totalAmount) > 0
                  ? Math.min(100, Math.round((Number(sale.paidAmount) / Number(sale.totalAmount)) * 100))
                  : 0
                const daysOld = daysBetween(String(sale.date))
                const isUrgent = daysOld > 14
                return (
                  <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0 text-xs font-bold">
                      {(sale.customer?.name ?? '?').charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {sale.customer?.name || 'Client anonyme'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${paidPct}%` }} />
                        </div>
                        <span className="text-xs text-zinc-400">{paidPct}% payé</span>
                        {isUrgent && (
                          <span className="text-xs font-semibold text-red-500">{daysOld}j</span>
                        )}
                      </div>
                    </div>

                    {/* Amount + action */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-500">{fmt(remaining, cur)}</p>
                      <p className="text-xs text-zinc-400">reste</p>
                    </div>

                    <Link
                      to="/unpaid-bills"
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
                    >
                      Payer
                    </Link>
                  </div>
                )
              })}
            </div>

            {(unpaidPage?.meta?.total ?? 0) > 5 && (
              <Link
                to="/unpaid-bills"
                className="flex items-center justify-center gap-1 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs font-medium text-emi-violet hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
              >
                Voir les {(unpaidPage?.meta?.total ?? 0) - 5} autres dettes <Icon name="chevron-right" size={12} />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Recent activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Sales */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                <Icon name="sales" size={14} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ventes récentes</h3>
            </div>
            <Link to="/sales" className="text-xs text-emi-violet hover:underline flex items-center gap-1">
              Toutes <Icon name="chevron-right" size={12} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {data?.recentSales?.length ? data.recentSales.slice(0, 5).map(s => {
              const isPaid = s.status === 'completed' || Number(s.paidAmount) >= Number(s.totalAmount)
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'}`}>
                      {(s.customer?.name ?? 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{s.customer?.name || 'Client de passage'}</p>
                      <p className="text-xs text-zinc-400">{s.date?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    {canSeeMoney && (
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{fmt(Number(s.totalAmount), cur)}</p>
                    )}
                    <Badge variant={isPaid ? 'success' : 'warning'} dot>
                      {isPaid ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              )
            }) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-zinc-400">Aucune vente récente</p>
                <Link to="/sales" className="text-xs text-emi-violet hover:underline mt-1 inline-block">
                  Enregistrer une vente
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions (canSeeMoney only) or stock state (stock role) */}
        {canSeeMoney ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-emi-violet">
                  <Icon name="arrow-up-down" size={14} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Transactions récentes</h3>
              </div>
              <Link to="/transactions" className="text-xs text-emi-violet hover:underline flex items-center gap-1">
                Toutes <Icon name="chevron-right" size={12} />
              </Link>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
              {data?.recentTransactions?.length ? data.recentTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-red-50 dark:bg-red-950/30 text-red-500'}`}>
                      <Icon name={tx.type === 'income' ? 'arrow-up' : 'arrow-down'} size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{tx.description || tx.reference}</p>
                      <p className="text-xs text-zinc-400">{tx.date?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold shrink-0 ml-3 ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(Number(tx.amount), cur)}
                  </p>
                </div>
              )) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-zinc-400">Aucune transaction récente</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Secondary KPIs for cashier / stock: just customer count + low stock */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {(isCashier || isManager) && (
              <StatCard title="Clients" value={k?.totalCustomers ?? 0} color="violet" icon={<Icon name="customers" size={20} />} />
            )}
            {(isStock || isCashier) && (
              <StatCard
                title="Stock bas"
                value={k?.lowStockCount ?? 0}
                subtitle="à réapprovisionner"
                color={(k?.lowStockCount ?? 0) > 0 ? 'red' : 'green'}
                icon={<Icon name="alert" size={20} />}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Financial chart (admin/manager only) ── */}
      {canSeeMoney && chartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Flux financiers récents</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Revenus vs Dépenses</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-zinc-400"><span className="w-2.5 h-2.5 rounded-full bg-emi-violet inline-block" /> Revenus</span>
              <span className="flex items-center gap-1 text-zinc-400"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Dépenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="dashGradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dashGradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
              <Tooltip content={<CustomTooltip currency={cur} />} />
              <Area type="monotone" dataKey="Revenus" stroke="#7C3AED" strokeWidth={2} fill="url(#dashGradRev)" dot={false} activeDot={{ r: 4, fill: '#7C3AED' }} />
              <Area type="monotone" dataKey="Dépenses" stroke="#EF4444" strokeWidth={2} fill="url(#dashGradExp)" dot={false} activeDot={{ r: 4, fill: '#EF4444' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
