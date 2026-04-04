import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { StatCard } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAppStore, useThemeStore } from '../stores'
import api from '../services/api'
import type { Supplier, Transaction, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function buildChartData(transactions: Transaction[]) {
  const monthly: Record<string, number> = {}
  for (const tx of transactions) {
    const d = tx.date?.toString().slice(0, 7) ?? 'N/A'
    monthly[d] = (monthly[d] || 0) + Number(tx.amount)
  }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentBusiness } = useAppStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [showEdit, setShowEdit] = useState(false)
  const [eName, setEName] = useState('')
  const [eEmail, setEEmail] = useState('')
  const [ePhone, setEPhone] = useState('')
  const [eAddress, setEAddress] = useState('')
  const [eNotes, setENotes] = useState('')

  const { data: supplier, isLoading: loadingSupplier } = useQuery<Supplier>({
    queryKey: ['supplier', id],
    queryFn: async () => (await api.get(`/suppliers/${id}`)).data,
    enabled: !!id,
  })

  // Transactions endpoint returns paginated response
  const { data: txPage, isLoading: loadingTx } = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['supplier-transactions', id, bid, supplier?.name],
    queryFn: async () =>
      (await api.get('/transactions', {
        params: { business_id: bid, type: 'expense', beneficiary: supplier?.name, per_page: 200 },
      })).data,
    enabled: !!id && !!bid && !!supplier?.name,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put(`/suppliers/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier', id] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', bid] })
      setShowEdit(false)
    },
  })

  const openEdit = () => {
    if (!supplier) return
    setEName(supplier.name); setEEmail(supplier.email || ''); setEPhone(supplier.phone || '')
    setEAddress(supplier.address || ''); setENotes(supplier.notes || '')
    setShowEdit(true)
  }

  if (loadingSupplier || loadingTx) return <Loader />
  if (!supplier) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-zinc-500 dark:text-zinc-400">Fournisseur introuvable.</p>
      <Link to="/suppliers" className="mt-3 text-sm text-emi-violet hover:underline">← Retour aux fournisseurs</Link>
    </div>
  )

  const transactions = txPage?.data ?? []
  const totalExpenses = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const avgTx = transactions.length > 0 ? totalExpenses / transactions.length : 0
  const chartData = buildChartData(transactions)
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const textColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/suppliers" className="text-zinc-400 hover:text-emi-violet transition-colors flex items-center gap-1">
          <Icon name="suppliers" size={15} />
          <span>Fournisseurs</span>
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{supplier.name}</span>
      </div>

      {/* Profile header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm">
            {getInitials(supplier.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{supplier.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {supplier.email && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{supplier.email}</span>
              )}
              {supplier.phone && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{supplier.phone}</span>
              )}
              {supplier.address && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{supplier.address}</span>
              )}
            </div>
            {supplier.notes && (
              <p className="text-xs text-zinc-400 mt-1.5 italic">{supplier.notes}</p>
            )}
          </div>
          <button
            onClick={openEdit}
            className="shrink-0 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Modifier"
          >
            <Icon name="edit" size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Total dépenses" value={fmt(totalExpenses, cur)} color="red" icon={<Icon name="arrow-down" size={18} />} />
        <StatCard title="Transactions" value={transactions.length} color="violet" icon={<Icon name="bar-chart" size={18} />} />
        <StatCard title="Moyenne / transaction" value={fmt(avgTx, cur)} color="blue" icon={<Icon name="trending-up" size={18} />} />
      </div>

      {/* Monthly chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Évolution des dépenses</h3>
          <p className="text-xs text-zinc-400 mb-4">Montant total par mois</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSupplier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#18181b' : '#fff',
                  border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                  borderRadius: 10, fontSize: 12,
                }}
                formatter={(v) => [fmt(Number(v), cur), 'Dépenses']}
              />
              <Area type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2} fill="url(#gradSupplier)" dot={false} activeDot={{ r: 4, fill: '#EF4444' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions list */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-emi-violet">
            <Icon name="arrow-up-down" size={14} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Transactions de dépenses</h3>
          <span className="ml-auto text-xs text-zinc-400">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
        </div>

        {transactions.length ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {tx.description || tx.reference}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-zinc-400">{tx.date?.toString().slice(0, 10)}</p>
                    {tx.category && <Badge variant="info">{tx.category.name}</Badge>}
                  </div>
                </div>
                <p className="text-sm font-semibold text-red-500 shrink-0">
                  -{fmt(Number(tx.amount), cur)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-400">Aucune transaction de dépense enregistrée pour ce fournisseur.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le fournisseur">
        <div className="space-y-3">
          <Input label="Nom *" value={eName} onChange={e => setEName(e.target.value)} required />
          <Input label="Email" type="email" value={eEmail} onChange={e => setEEmail(e.target.value)} />
          <Input label="Téléphone" value={ePhone} onChange={e => setEPhone(e.target.value)} />
          <Input label="Adresse" value={eAddress} onChange={e => setEAddress(e.target.value)} />
          <Input label="Notes" value={eNotes} onChange={e => setENotes(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">Annuler</Button>
            <Button onClick={() => updateMutation.mutate({ name: eName, email: eEmail || null, phone: ePhone || null, address: eAddress || null, notes: eNotes || null })} className="flex-1" loading={updateMutation.isPending} disabled={!eName.trim()}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
