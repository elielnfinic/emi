import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { StatCard } from '../components/ui/Card'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Rotation } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

function daysBetween(a: string, b?: string | null) {
  const end = b ? new Date(b) : new Date()
  const start = new Date(a)
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86_400_000))
}

export function RotationsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [initialCapital, setInitialCapital] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery<Rotation[]>({
    queryKey: ['rotations', bid],
    queryFn: async () => (await api.get('/rotations', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/rotations', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotations', bid] })
      resetForm()
      setShowModal(false)
    },
  })

  const closeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/rotations/${id}/close`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rotations', bid] }),
  })

  const resetForm = () => {
    setName(''); setStartDate(new Date().toISOString().split('T')[0])
    setInitialCapital(''); setNotes('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid, name,
      startDate: startDate || undefined,
      initialCapital: initialCapital ? Number(initialCapital) : 0,
      notes: notes || undefined,
    })
  }

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-5">
        <Icon name="rotations" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un business pour gérer les rotations.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const rotations = data ?? []
  const active = rotations.filter(r => r.status === 'active')
  const closed = rotations.filter(r => r.status === 'closed')
  const totalCapital = rotations.reduce((s, r) => s + Number(r.initialCapital), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Rotations</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentBusiness?.name} · {rotations.length} rotation{rotations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}>
          <Icon name="plus" size={15} className="mr-1" /> Nouvelle rotation
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="En cours" value={active.length} color="green" icon={<Icon name="rotations" size={18} />} />
        <StatCard title="Clôturées" value={closed.length} color="violet" icon={<Icon name="bar-chart" size={18} />} />
        <StatCard title="Capital total" value={fmt(totalCapital, cur)} color="blue" icon={<Icon name="wallet" size={18} />} />
      </div>

      {/* Active rotations */}
      {active.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 px-1">En cours</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map(r => (
              <div key={r.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Depuis {r.startDate}</p>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-2">
                    <p className="text-zinc-400">Capital initial</p>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{fmt(Number(r.initialCapital), cur)}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-2">
                    <p className="text-zinc-400">Durée</p>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{daysBetween(r.startDate)} j</p>
                  </div>
                </div>
                {r.notes && <p className="text-xs text-zinc-400 italic">{r.notes}</p>}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  loading={closeMutation.isPending}
                  onClick={() => { if (window.confirm('Clôturer cette rotation ?')) closeMutation.mutate(r.id) }}
                >
                  Clôturer
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closed rotations */}
      {closed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 px-1">Historique</p>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {closed.map(r => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{r.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {r.startDate} → {r.endDate ?? '?'} · {daysBetween(r.startDate, r.endDate)} jours
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{fmt(Number(r.initialCapital), cur)}</p>
                    <Badge variant="default">Clôturée</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {rotations.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
            <Icon name="rotations" size={26} />
          </div>
          <p className="text-sm text-zinc-400">Aucune rotation. Démarrez votre première rotation.</p>
          <button onClick={() => { resetForm(); setShowModal(true) }} className="mt-2 text-sm text-emi-violet hover:underline">
            + Créer une rotation
          </button>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle rotation">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nom *" value={name} onChange={e => setName(e.target.value)} required placeholder="Rotation Janvier 2025" />
          <Input label="Date de début" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="Capital initial" type="number" step="0.01" value={initialCapital} onChange={e => setInitialCapital(e.target.value)} placeholder="0.00" />
          <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optionnel" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>Démarrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
