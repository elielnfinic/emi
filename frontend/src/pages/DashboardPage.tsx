import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { StatCard } from '../components/ui/Card'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { useAppStore, useAuthStore, useThemeStore } from '../stores'
import api from '../services/api'
import type { DashboardData, Transaction } from '../types'

function fmt(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function fmtShort(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`
  return String(amount)
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
    .map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      Revenus: vals.income,
      Dépenses: vals.expense,
    }))
}

const CustomTooltip = ({ active, payload, label, currency }: { active?: boolean; payload?: {color: string; name: string; value: number}[]; label?: string; currency: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-500 dark:text-zinc-400">{p.name}:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fmt(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { currentBusiness } = useAppStore()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const businessId = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'

  const businessRole = businessId ? user?.businessRoles?.[businessId] : undefined
  const canSeeMoney = user?.role === 'superadmin' || businessRole === 'admin' || businessRole === 'manager'

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', businessId],
    queryFn: async () => (await api.get('/dashboard', { params: { business_id: businessId } })).data,
    enabled: !!businessId,
  })

  const chartData = useMemo(() => buildChartData(data?.recentTransactions ?? []), [data])

  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const textColor = isDark ? '#71717a' : '#a1a1aa'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentBusiness?.name} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      {canSeeMoney && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Balance"
            value={fmt(k?.balance ?? 0, cur)}
            color="violet"
            icon={<Icon name="wallet" size={20} />}
          />
          <StatCard
            title="Ventes du jour"
            value={fmt(k?.todaySalesTotal ?? 0, cur)}
            subtitle={`${k?.todaySalesCount ?? 0} transaction${(k?.todaySalesCount ?? 0) > 1 ? 's' : ''}`}
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
            color={k?.lowStockCount ? 'red' : 'green'}
            icon={<Icon name="alert" size={20} />}
          />
        </div>
      )}

      {/* Secondary KPIs */}
      {canSeeMoney && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenus" value={fmt(k?.totalIncome ?? 0, cur)} color="green" icon={<Icon name="arrow-up" size={20} />} />
          <StatCard title="Total Dépenses" value={fmt(k?.totalExpense ?? 0, cur)} color="red" icon={<Icon name="arrow-down" size={20} />} />
          <StatCard title="Clients" value={k?.totalCustomers ?? 0} color="violet" icon={<Icon name="customers" size={20} />} />
        </div>
      )}

      {/* Chart */}
      {canSeeMoney && chartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Flux financiers</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Revenus vs Dépenses · transactions récentes</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
              <Tooltip content={<CustomTooltip currency={cur} />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="Revenus" stroke="#7C3AED" strokeWidth={2} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 4, fill: '#7C3AED' }} />
              <Area type="monotone" dataKey="Dépenses" stroke="#EF4444" strokeWidth={2} fill="url(#gradExpense)" dot={false} activeDot={{ r: 4, fill: '#EF4444' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income vs Expense bar */}
      {canSeeMoney && chartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Comparaison par jour</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Volume quotidien</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
              <Tooltip content={<CustomTooltip currency={cur} />} />
              <Bar dataKey="Revenus" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-emi-violet">
              <Icon name="arrow-up-down" size={15} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Transactions récentes</h3>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {data?.recentTransactions?.length ? data.recentTransactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{tx.description || tx.reference}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{tx.reference} · {tx.date?.slice(0, 10)}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  {canSeeMoney && (
                    <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount, cur)}
                    </p>
                  )}
                  <Badge variant={tx.type === 'income' ? 'success' : 'danger'} dot>{tx.type}</Badge>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-zinc-400">Aucune transaction récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emi-green">
              <Icon name="sales" size={15} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ventes récentes</h3>
          </div>
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {data?.recentSales?.length ? data.recentSales.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{s.customer?.name || 'Client de passage'}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{s.reference} · {s.date?.slice(0, 10)}</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  {canSeeMoney && (
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{fmt(s.totalAmount, cur)}</p>
                  )}
                  <Badge variant={s.status === 'completed' ? 'success' : 'warning'} dot>{s.status}</Badge>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-zinc-400">Aucune vente récente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
