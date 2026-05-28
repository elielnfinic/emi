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
import type { Customer, PaginatedResponse, Sale } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function buildChartData(sales: Sale[]) {
  const monthly: Record<string, number> = {}
  for (const s of sales) {
    const d = s.date?.toString().slice(0, 7) ?? 'N/A'
    monthly[d] = (monthly[d] || 0) + Number(s.totalAmount)
  }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function CustomerDetailPage() {
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

  const { data: customer, isLoading: loadingCustomer } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => (await api.get(`/customers/${id}`)).data,
    enabled: !!id,
  })

  // Sales endpoint returns paginated response
  const { data: salesPage, isLoading: loadingSales } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['customer-sales', id, bid],
    queryFn: async () =>
      (await api.get('/sales', { params: { business_id: bid, customer_id: id, per_page: 200 } })).data,
    enabled: !!id && !!bid,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put(`/customers/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] })
      queryClient.invalidateQueries({ queryKey: ['customers', bid] })
      setShowEdit(false)
    },
  })

  const openEdit = () => {
    if (!customer) return
    setEName(customer.name); setEEmail(customer.email || ''); setEPhone(customer.phone || '')
    setEAddress(customer.address || ''); setENotes(customer.notes || '')
    setShowEdit(true)
  }

  const handleUpdate = () => {
    updateMutation.mutate({
      name: eName, email: eEmail || null, phone: ePhone || null,
      address: eAddress || null, notes: eNotes || null,
    })
  }

  if (loadingCustomer || loadingSales) return <Loader />
  if (!customer) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-zinc-500 dark:text-zinc-400">Client introuvable.</p>
      <Link to="/customers" className="mt-3 text-sm text-emi-violet hover:underline">← Retour aux clients</Link>
    </div>
  )

  const sales = salesPage?.data ?? []
  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0)
  const totalPaid = sales.reduce((sum, s) => sum + Number(s.paidAmount), 0)
  const totalDebt = totalSales - totalPaid
  const chartData = buildChartData(sales)
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const textColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/customers" className="text-zinc-400 hover:text-emi-violet transition-colors flex items-center gap-1">
          <Icon name="customers" size={15} />
          <span>Clients</span>
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{customer.name}</span>
      </div>

      {/* Profile header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm">
            {getInitials(customer.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{customer.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {customer.email && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{customer.email}</span>
              )}
              {customer.phone && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{customer.phone}</span>
              )}
              {customer.address && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{customer.address}</span>
              )}
            </div>
            {customer.notes && (
              <p className="text-xs text-zinc-400 mt-1.5 italic">{customer.notes}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total ventes" value={fmt(totalSales, cur)} color="green" icon={<Icon name="sales" size={18} />} />
        <StatCard title="Total payé" value={fmt(totalPaid, cur)} color="violet" icon={<Icon name="wallet" size={18} />} />
        <StatCard
          title="Impayés"
          value={fmt(totalDebt, cur)}
          color={totalDebt > 0 ? 'red' : 'green'}
          icon={<Icon name="alert" size={18} />}
        />
        <StatCard title="Transactions" value={sales.length} color="blue" icon={<Icon name="bar-chart" size={18} />} />
      </div>

      {/* Monthly chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">Évolution des achats</h3>
          <p className="text-xs text-zinc-400 mb-4">Montant total par mois</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCustomer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                formatter={(v) => [fmt(Number(v), cur), 'Ventes']}
              />
              <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} fill="url(#gradCustomer)" dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sales list */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emi-green">
            <Icon name="sales" size={14} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Historique des ventes</h3>
          <span className="ml-auto text-xs text-zinc-400">{sales.length} vente{sales.length !== 1 ? 's' : ''}</span>
        </div>

        {sales.length ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sales.map(s => {
              const paid = Number(s.paidAmount)
              const total = Number(s.totalAmount)
              const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{s.reference}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.date?.toString().slice(0, 10)}</p>
                  </div>
                  <div className="hidden sm:block w-24">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-emi-green" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{fmt(total, cur)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <Badge variant={s.type === 'cash' ? 'success' : 'warning'} dot>{s.type}</Badge>
                      <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-400">Aucune vente enregistrée pour ce client.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le client">
        <div className="space-y-3">
          <Input label="Nom *" value={eName} onChange={e => setEName(e.target.value)} required />
          <Input label="Email" type="email" value={eEmail} onChange={e => setEEmail(e.target.value)} />
          <Input label="Téléphone" value={ePhone} onChange={e => setEPhone(e.target.value)} />
          <Input label="Adresse" value={eAddress} onChange={e => setEAddress(e.target.value)} />
          <Input label="Notes" value={eNotes} onChange={e => setENotes(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">Annuler</Button>
            <Button onClick={handleUpdate} className="flex-1" loading={updateMutation.isPending} disabled={!eName.trim()}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
