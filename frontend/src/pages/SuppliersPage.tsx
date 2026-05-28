import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Supplier, PaginatedResponse } from '../types'

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
  'from-rose-500 to-pink-600',
  'from-teal-500 to-emerald-600',
]

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

export function SuppliersPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const [inputValue, setInputValue] = useState(search)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setInputValue(search) }, [search])

  const { data, isLoading } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers', bid, search, page],
    queryFn: async () => (await api.get('/suppliers', { params: { business_id: bid, search, page } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/suppliers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', bid] })
      resetForm()
      setShowModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: Record<string, unknown>) => api.put(`/suppliers/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', bid] })
      setEditSupplier(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/suppliers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers', bid] }),
  })

  const resetForm = () => { setName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('') }

  const openCreate = () => { resetForm(); setShowModal(true) }

  const openEdit = (s: Supplier) => {
    setEditSupplier(s)
    setName(s.name); setEmail(s.email || ''); setPhone(s.phone || '')
    setAddress(s.address || ''); setNotes(s.notes || '')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const payload = {
      businessId: bid, name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      notes: notes || undefined,
    }
    editSupplier ? updateMutation.mutate({ id: editSupplier.id, ...payload }) : createMutation.mutate(payload)
  }

  const applySearch = (e?: FormEvent) => {
    e?.preventDefault()
    setSearchParams(prev => { const n = new URLSearchParams(prev); inputValue.trim() ? n.set('search', inputValue.trim()) : n.delete('search'); n.set('page', '1'); return n })
  }

  const clearSearch = () => {
    setInputValue('')
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('search'); n.set('page', '1'); return n })
    searchRef.current?.focus()
  }

  const handlePageChange = (p: number) =>
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-5">
        <Icon name="suppliers" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un business pour gérer vos fournisseurs.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const suppliers  = data?.data ?? []
  const meta       = data?.meta
  const totalCount = meta?.total ?? suppliers.length
  const isPending  = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Fournisseurs</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentBusiness?.name} · {totalCount} fournisseur{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Icon name="plus" size={15} className="mr-1" /> Nouveau fournisseur
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={applySearch} className="relative">
        <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Rechercher par nom, email ou téléphone…"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applySearch()}
          className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emi-violet focus:ring-2 focus:ring-emi-violet/20 shadow-sm transition"
        />
        {inputValue && (
          <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <Icon name="x" size={14} />
          </button>
        )}
      </form>

      {/* List */}
      {suppliers.length ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
          {suppliers.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(s.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {getInitials(s.name)}
              </div>

              {/* Name + contact */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/suppliers/${s.id}`}
                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emi-violet transition-colors truncate block"
                >
                  {s.name}
                </Link>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {s.email && <span className="text-xs text-zinc-400 truncate">{s.email}</span>}
                  {s.phone && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.11 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.76a16 16 0 006.94 6.94l1.41-1.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      {s.phone}
                    </span>
                  )}
                  {s.address && (
                    <span className="text-xs text-zinc-400 truncate max-w-[160px]">{s.address}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/suppliers/${s.id}`}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-emi-violet hover:bg-emi-violet/10 transition-colors"
                  title="Voir les détails"
                >
                  <Icon name="chevron-right" size={15} />
                </Link>
                <button
                  onClick={() => openEdit(s)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-emi-violet hover:bg-emi-violet/10 transition-colors"
                  title="Modifier"
                >
                  <Icon name="edit" size={14} />
                </button>
                <button
                  onClick={() => { if (window.confirm('Supprimer ce fournisseur ?')) deleteMutation.mutate(s.id) }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Supprimer"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
            <Icon name="suppliers" size={26} />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {search ? 'Aucun fournisseur ne correspond à votre recherche.' : 'Aucun fournisseur pour l\'instant.'}
          </p>
          {!search && (
            <button onClick={openCreate} className="mt-3 text-sm text-emi-violet hover:underline">
              + Ajouter un fournisseur
            </button>
          )}
        </div>
      )}

      {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}

      {/* Modal */}
      <Modal
        isOpen={showModal || !!editSupplier}
        onClose={() => { setShowModal(false); setEditSupplier(null); resetForm() }}
        title={editSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nom *" value={name} onChange={e => setName(e.target.value)} required placeholder="Nom du fournisseur" />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com" />
          <Input label="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+XXX XX XX XX XX" />
          <Input label="Adresse" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rue, Ville, Pays" />
          <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optionnel" />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditSupplier(null); resetForm() }} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={isPending}>{editSupplier ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
