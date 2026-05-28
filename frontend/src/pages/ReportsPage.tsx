import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { StatCard } from '../components/ui/Card'
import { useAppStore, useThemeStore } from '../stores'
import api from '../services/api'
import type { Sale, Transaction, StockItem, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function exportCSV(rows: string[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

type Tab = 'sales' | 'transactions' | 'stock'

const PIE_COLORS = ['#7C3AED', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

export function ReportsPage() {
  const { currentBusiness } = useAppStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'

  const [tab, setTab] = useState<Tab>('sales')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const textColor = isDark ? '#71717a' : '#a1a1aa'

  // All use PaginatedResponse — the backend paginates everything
  const { data: salesPage, isLoading: salesLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['report-sales', bid, from, to],
    queryFn: async () => {
      const params: Record<string, unknown> = { business_id: bid, per_page: 500 }
      if (from) params.from = from
      if (to) params.to = to
      return (await api.get('/sales', { params })).data
    },
    enabled: !!bid && tab === 'sales',
  })

  const { data: txPage, isLoading: txLoading } = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['report-transactions', bid, from, to],
    queryFn: async () => {
      const params: Record<string, unknown> = { business_id: bid, per_page: 500 }
      if (from) params.from = from
      if (to) params.to = to
      return (await api.get('/transactions', { params })).data
    },
    enabled: !!bid && tab === 'transactions',
  })

  const { data: stockPage, isLoading: stockLoading } = useQuery<PaginatedResponse<StockItem>>({
    queryKey: ['report-stock', bid],
    queryFn: async () =>
      (await api.get('/stock-items', { params: { business_id: bid, per_page: 500 } })).data,
    enabled: !!bid && tab === 'stock',
  })

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-5">
        <Icon name="reports" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un business pour voir les rapports.</p>
    </div>
  )

  const sales = salesPage?.data ?? []
  const transactions = txPage?.data ?? []
  const stockItems = stockPage?.data ?? []

  // Sales stats
  const totalSales = sales.reduce((s, x) => s + Number(x.totalAmount), 0)
  const totalPaid = sales.reduce((s, x) => s + Number(x.paidAmount), 0)
  const creditSales = sales.filter(s => s.type === 'credit').length
  const cashSales = sales.filter(s => s.type === 'cash').length

  // Transaction stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Stock stats
  const totalStockValue = stockItems.reduce((s, i) => s + i.quantity * (i.sellingPrice || 0), 0)
  const lowStockCount = stockItems.filter(i => i.quantity <= i.minQuantity).length
  const outStockCount = stockItems.filter(i => i.quantity === 0).length

  // Sales by customer pie
  const byCust: Record<string, number> = {}
  for (const s of sales) {
    const name = s.customer?.name || 'Walk-in'
    byCust[name] = (byCust[name] || 0) + Number(s.totalAmount)
  }
  const custPie = Object.entries(byCust).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }))

  // Tx by category bar
  const byCat: Record<string, { income: number; expense: number }> = {}
  for (const tx of transactions) {
    const name = tx.category?.name || 'Sans catégorie'
    if (!byCat[name]) byCat[name] = { income: 0, expense: 0 }
    byCat[name][tx.type] += Number(tx.amount)
  }
  const catBar = Object.entries(byCat).map(([name, vals]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, ...vals }))

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'sales', label: 'Ventes', icon: 'sales' },
    { key: 'transactions', label: 'Transactions', icon: 'arrow-up-down' },
    { key: 'stock', label: 'Stock', icon: 'stock' },
  ]

  const tooltipStyle = {
    background: isDark ? '#18181b' : '#fff',
    border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
    borderRadius: 10, fontSize: 12,
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Rapports</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{currentBusiness?.name}</p>
        </div>
        {/* Export */}
        {tab === 'sales' && sales.length > 0 && (
          <button
            onClick={() => exportCSV(
              [['Référence', 'Client', 'Type', 'Total', 'Payé', 'Statut', 'Date'],
               ...sales.map(s => [s.reference, s.customer?.name || 'Walk-in', s.type, String(s.totalAmount), String(s.paidAmount), s.status, String(s.date)])],
              `rapport-ventes-${new Date().toISOString().slice(0, 10)}.csv`
            )}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Icon name="download" size={14} /> Exporter CSV
          </button>
        )}
        {tab === 'transactions' && transactions.length > 0 && (
          <button
            onClick={() => exportCSV(
              [['Référence', 'Type', 'Montant', 'Description', 'Bénéficiaire', 'Date'],
               ...transactions.map(t => [t.reference, t.type, String(t.amount), t.description || '', t.beneficiary || '', String(t.date)])],
              `rapport-transactions-${new Date().toISOString().slice(0, 10)}.csv`
            )}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Icon name="download" size={14} /> Exporter CSV
          </button>
        )}
        {tab === 'stock' && stockItems.length > 0 && (
          <button
            onClick={() => exportCSV(
              [['Nom', 'SKU', 'Catégorie', 'Qté', 'Unité', 'Prix vente', 'Valeur stock'],
               ...stockItems.map(i => [i.name, i.sku || '', i.category || '', String(i.quantity), i.unit, String(i.sellingPrice ?? ''), String((i.sellingPrice || 0) * i.quantity)])],
              `rapport-stock-${new Date().toISOString().slice(0, 10)}.csv`
            )}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Icon name="download" size={14} /> Exporter CSV
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Date range (sales + transactions) */}
      {(tab === 'sales' || tab === 'transactions') && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-32">
              <Input label="Du" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="flex-1 min-w-32">
              <Input label="Au" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            {(from || to) && (
              <button
                onClick={() => { setFrom(''); setTo('') }}
                className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mb-1"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── SALES TAB ── */}
      {tab === 'sales' && (
        salesLoading ? <Loader /> : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard title="Chiffre d'affaires" value={fmt(totalSales, cur)} color="green" icon={<Icon name="sales" size={18} />} />
              <StatCard title="Total encaissé" value={fmt(totalPaid, cur)} color="violet" icon={<Icon name="wallet" size={18} />} />
              <StatCard title="Ventes comptant" value={cashSales} color="blue" icon={<Icon name="dollar-sign" size={18} />} />
              <StatCard title="Ventes à crédit" value={creditSales} color={creditSales > 0 ? 'amber' : 'green'} icon={<Icon name="debt" size={18} />} />
            </div>

            {custPie.length > 1 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Top clients</p>
                <p className="text-xs text-zinc-400 mb-4">Chiffre d'affaires par client</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={custPie} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                      {custPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(Number(v), cur)]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {custPie.map((c, i) => (
                    <span key={c.name} className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Liste des ventes</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      {['Référence', 'Client', 'Type', 'Total', 'Statut', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {sales.length ? sales.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{s.reference}</td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{s.customer?.name || 'Walk-in'}</td>
                        <td className="px-4 py-3"><Badge variant={s.type === 'cash' ? 'success' : 'warning'}>{s.type}</Badge></td>
                        <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">{fmt(Number(s.totalAmount), cur)}</td>
                        <td className="px-4 py-3"><Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge></td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{String(s.date).slice(0, 10)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-400">Aucune vente sur cette période.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {tab === 'transactions' && (
        txLoading ? <Loader /> : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard title="Total revenus" value={fmt(totalIncome, cur)} color="green" icon={<Icon name="arrow-up" size={18} />} />
              <StatCard title="Total dépenses" value={fmt(totalExpense, cur)} color="red" icon={<Icon name="arrow-down" size={18} />} />
              <StatCard title="Solde net" value={fmt(totalIncome - totalExpense, cur)} color={totalIncome >= totalExpense ? 'violet' : 'red'} icon={<Icon name="wallet" size={18} />} />
            </div>

            {catBar.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Par catégorie</p>
                <p className="text-xs text-zinc-400 mb-4">Revenus et dépenses par catégorie</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={catBar} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(Number(v), cur)]} />
                    <Bar dataKey="income" name="Revenus" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Détail des transactions</p>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {transactions.length ? transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emi-green' : 'bg-red-50 dark:bg-red-950/30 text-red-500'}`}>
                      <Icon name={tx.type === 'income' ? 'arrow-up' : 'arrow-down'} size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{tx.description || tx.reference}</p>
                      <p className="text-xs text-zinc-400">{String(tx.date).slice(0, 10)}{tx.beneficiary ? ` · ${tx.beneficiary}` : ''}</p>
                    </div>
                    <p className={`text-sm font-bold shrink-0 ${tx.type === 'income' ? 'text-emi-green' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '−'}{fmt(Number(tx.amount), cur)}
                    </p>
                  </div>
                )) : (
                  <div className="py-10 text-center text-sm text-zinc-400">Aucune transaction sur cette période.</div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* ── STOCK TAB ── */}
      {tab === 'stock' && (
        stockLoading ? <Loader /> : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard title="Total articles" value={stockItems.length} color="violet" icon={<Icon name="package" size={18} />} />
              <StatCard title="Valeur totale" value={fmt(totalStockValue, cur)} color="green" icon={<Icon name="dollar-sign" size={18} />} />
              <StatCard title="Alertes stock bas" value={lowStockCount + outStockCount} color={lowStockCount + outStockCount > 0 ? 'red' : 'green'} icon={<Icon name="alert" size={18} />} />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Inventaire complet</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      {['Produit', 'SKU', 'Catégorie', 'Qté', 'Unité', 'Prix vente', 'Valeur', 'Statut'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {stockItems.length ? stockItems.map(i => {
                      const isOut = i.quantity === 0
                      const isLow = !isOut && i.quantity <= i.minQuantity
                      return (
                        <tr key={i.id} className={`transition-colors ${isOut ? 'bg-red-50/30 dark:bg-red-950/10' : isLow ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'}`}>
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{i.name}</td>
                          <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{i.sku || '—'}</td>
                          <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{i.category || '—'}</td>
                          <td className={`px-4 py-3 font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-zinc-800 dark:text-zinc-200'}`}>{i.quantity}</td>
                          <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{i.unit}</td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{i.sellingPrice != null ? fmt(i.sellingPrice, cur) : '—'}</td>
                          <td className="px-4 py-3 font-medium text-emi-violet">{fmt((i.sellingPrice || 0) * i.quantity, cur)}</td>
                          <td className="px-4 py-3">
                            {isOut ? <Badge variant="danger">Rupture</Badge> : isLow ? <Badge variant="warning">Bas</Badge> : <Badge variant="success">OK</Badge>}
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-400">Aucun article.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}
