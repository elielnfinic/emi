import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Proforma } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'info' | 'danger' | 'success'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'warning',
  converted: 'success',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  converted: 'Converti',
}

export function ProformaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentBusiness } = useAppStore()
  const navigate = useNavigate()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const qc = useQueryClient()

  const [showSend, setShowSend] = useState(false)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')

  const { data: p, isLoading } = useQuery<Proforma>({
    queryKey: ['proforma', id],
    queryFn: async () => (await api.get(`/proformas/${id}`)).data,
    enabled: !!id,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['proforma', id] })
    qc.invalidateQueries({ queryKey: ['proformas', bid] })
  }

  const sendMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post(`/proformas/${id}/send`, payload),
    onSuccess: () => { invalidate(); setShowSend(false) },
  })
  const convertMutation = useMutation({
    mutationFn: () => api.post(`/proformas/${id}/convert`),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: ['sales', bid] }); qc.invalidateQueries({ queryKey: ['stock-items', bid] }) },
  })
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/proformas/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['proformas', bid] }); navigate('/proformas') },
  })

  const openSend = () => {
    if (!p) return
    setSendEmail(p.customer?.email || '')
    setSendMessage('')
    setShowSend(true)
  }

  const handleExport = async () => {
    if (!p) return
    const res = await api.get(`/proformas/${p.id}/export`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${p.reference}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) return <Loader />
  if (!p) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-zinc-500 dark:text-zinc-400">Proforma introuvable.</p>
      <Link to="/proformas" className="mt-3 text-sm text-emi-violet hover:underline">← Retour aux proformas</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/proformas" className="text-zinc-400 hover:text-emi-violet transition-colors flex items-center gap-1">
          <Icon name="proformas" size={15} />
          <span>Proformas</span>
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{p.reference}</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{p.reference}</h1>
              <Badge variant={STATUS_VARIANT[p.status]} dot>{STATUS_LABEL[p.status]}</Badge>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{p.customer?.name || 'Client de passage'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Icon name="download" size={13} className="mr-1" /> Exporter en PDF
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Date</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{String(p.date).slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Valide jusqu'au</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{p.validUntil ? String(p.validUntil).slice(0, 10) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Créé par</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{p.user?.fullName || p.user?.email || '—'}</p>
          </div>
        </div>

        {p.status === 'converted' && p.saleId && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
            Convertie en vente #{p.saleId}
          </div>
        )}
        {p.notes && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 italic">{p.notes}</p>
        )}

        <div className="flex items-center gap-2 mt-5 flex-wrap">
          {p.status !== 'converted' && (
            <Button size="sm" variant="outline" onClick={openSend}>
              <Icon name="mail" size={13} className="mr-1" /> Envoyer au client
            </Button>
          )}
          {(p.status === 'sent' || p.status === 'accepted') && (
            <Button size="sm" onClick={() => convertMutation.mutate()} loading={convertMutation.isPending}>Convertir en vente</Button>
          )}
          {p.status !== 'converted' && (
            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => window.confirm('Supprimer ce proforma ?') && deleteMutation.mutate()}>Supprimer</Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Articles</h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {(p.items ?? []).map(it => (
            <div key={it.id} className="flex items-center justify-between px-5 py-3 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{it.name}</p>
                <p className="text-xs text-zinc-400">{it.quantity} × {fmt(Number(it.unitPrice), cur)}</p>
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">{fmt(Number(it.totalPrice), cur)}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Total</span>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{fmt(Number(p.totalAmount), cur)}</span>
        </div>
      </div>

      <Modal isOpen={showSend} onClose={() => setShowSend(false)} title={`Envoyer ${p.reference} au client`}>
        <div className="space-y-3">
          <Input label="Email du destinataire *" type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="client@exemple.com" />
          <Input label="Message (optionnel)" value={sendMessage} onChange={e => setSendMessage(e.target.value)} placeholder="Un mot pour le client…" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowSend(false)} className="flex-1">Annuler</Button>
            <Button
              type="button" className="flex-1"
              loading={sendMutation.isPending}
              disabled={!sendEmail.trim()}
              onClick={() => sendMutation.mutate({ email: sendEmail.trim(), message: sendMessage.trim() || undefined })}
            >
              Envoyer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
