import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { useAppStore, useAuthStore } from '../stores'
import api from '../services/api'
import type { Requisition } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'info' | 'danger' | 'success'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'info',
  rejected: 'danger',
  converted: 'success',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  converted: 'Convertie',
}

export function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentBusiness } = useAppStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const qc = useQueryClient()

  const currentRole = user?.role === 'superadmin' ? 'admin' : (bid ? user?.businessRoles?.[bid] : null)
  const canApprove = currentRole === 'admin' || currentRole === 'manager'

  const { data: r, isLoading } = useQuery<Requisition>({
    queryKey: ['requisition', id],
    queryFn: async () => (await api.get(`/requisitions/${id}`)).data,
    enabled: !!id,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['requisition', id] })
    qc.invalidateQueries({ queryKey: ['requisitions', bid] })
    qc.invalidateQueries({ queryKey: ['stock-items', bid] })
    qc.invalidateQueries({ queryKey: ['transactions', bid] })
  }

  const submitMutation = useMutation({ mutationFn: () => api.post(`/requisitions/${id}/submit`), onSuccess: invalidate })
  const approveMutation = useMutation({ mutationFn: () => api.post(`/requisitions/${id}/approve`), onSuccess: invalidate })
  const rejectMutation = useMutation({
    mutationFn: () => api.post(`/requisitions/${id}/reject`, { rejectionReason: window.prompt('Motif du rejet (optionnel)') || undefined }),
    onSuccess: invalidate,
  })
  const convertMutation = useMutation({ mutationFn: () => api.post(`/requisitions/${id}/convert`), onSuccess: invalidate })
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/requisitions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requisitions', bid] }); navigate('/requisitions') },
  })

  const handleExport = async () => {
    if (!r) return
    const res = await api.get(`/requisitions/${r.id}/export`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${r.reference}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) return <Loader />
  if (!r) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-zinc-500 dark:text-zinc-400">Réquisition introuvable.</p>
      <Link to="/requisitions" className="mt-3 text-sm text-emi-violet hover:underline">← Retour aux réquisitions</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/requisitions" className="text-zinc-400 hover:text-emi-violet transition-colors flex items-center gap-1">
          <Icon name="requisitions" size={15} />
          <span>Réquisitions</span>
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{r.reference}</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{r.reference}</h1>
              <Badge variant={STATUS_VARIANT[r.status]} dot>{STATUS_LABEL[r.status]}</Badge>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{r.supplier?.name || 'Sans fournisseur'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Icon name="download" size={13} className="mr-1" /> Exporter en PDF
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Date</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{String(r.date).slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Besoin avant le</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{r.neededByDate ? String(r.neededByDate).slice(0, 10) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Demandeur</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{r.user?.fullName || r.user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Approuvé par</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{r.approvedBy?.fullName || r.approvedBy?.email || '—'}</p>
          </div>
        </div>

        {r.status === 'rejected' && r.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-600 dark:text-red-400">
            Motif du rejet : {r.rejectionReason}
          </div>
        )}
        {r.notes && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 italic">{r.notes}</p>
        )}

        <div className="flex items-center gap-2 mt-5 flex-wrap">
          {r.status === 'draft' && (
            <>
              <Button size="sm" onClick={() => submitMutation.mutate()} loading={submitMutation.isPending}>Soumettre</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => window.confirm('Supprimer cette réquisition ?') && deleteMutation.mutate()}>Supprimer</Button>
            </>
          )}
          {r.status === 'pending' && canApprove && (
            <>
              <Button size="sm" onClick={() => approveMutation.mutate()} loading={approveMutation.isPending}>Approuver</Button>
              <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => rejectMutation.mutate()}>Rejeter</Button>
            </>
          )}
          {r.status === 'approved' && (
            <Button size="sm" onClick={() => convertMutation.mutate()} loading={convertMutation.isPending}>Convertir en achat</Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Articles demandés</h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {(r.items ?? []).map(it => (
            <div key={it.id} className="flex items-center justify-between px-5 py-3 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{it.name}</p>
                <p className="text-xs text-zinc-400">{it.quantity} × {fmt(Number(it.estimatedUnitPrice ?? 0), cur)} (est.)</p>
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">
                {fmt(Number(it.quantity) * Number(it.estimatedUnitPrice ?? 0), cur)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Total estimé</span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{fmt(Number(r.totalAmount), cur)}</span>
        </div>
      </div>
    </div>
  )
}
