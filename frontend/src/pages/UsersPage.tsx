import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { useAppStore, useAuthStore } from '../stores'
import api from '../services/api'
import type { BusinessUser, Role, User } from '../types'

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
]
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }
function getInitials(name?: string | null, email?: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (email ?? '?').charAt(0).toUpperCase()
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400',
  manager: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  cashier: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  stock: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
}

export function UsersPage() {
  const { currentBusiness } = useAppStore()
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRoleId, setEditRoleId] = useState('')

  const [userId, setUserId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [assignBusinessId, setAssignBusinessId] = useState(String(bid ?? ''))

  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [createError, setCreateError] = useState('')

  const { data: businessUsers, isLoading } = useQuery<BusinessUser[]>({
    queryKey: ['business-users', bid],
    queryFn: async () => (await api.get('/business-users', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const { data: allUsers } = useQuery<User[]>({
    queryKey: ['all-users'],
    queryFn: async () => (await api.get('/business-users/users')).data,
    enabled: !!bid,
  })

  const { data: allBusinesses } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['businesses'],
    queryFn: async () => (await api.get('/businesses')).data,
    enabled: !!bid,
  })

  const { data: roles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => (await api.get('/roles')).data,
  })

  const assignMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/business-users', payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-users', variables.businessId] })
      queryClient.invalidateQueries({ queryKey: ['business-users', bid] })
      setUserId(''); setRoleId(''); setAssignBusinessId(String(bid ?? ''))
      setShowAssignModal(false)
    },
  })

  const createUserMutation = useMutation({
    mutationFn: (payload: { fullName: string; email: string; password: string; sendEmail: boolean }) =>
      api.post('/business-users/create-user', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] })
      setNewFullName(''); setNewEmail(''); setNewPassword(''); setSendEmail(true)
      setCreateError(''); setShowCreateModal(false)
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { errors?: { message: string }[]; error?: string } } }
      setCreateError(error.response?.data?.error || error.response?.data?.errors?.[0]?.message || 'Échec de la création.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/business-users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-users', bid] }),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, roleId }: { id: number; roleId: number }) =>
      api.patch(`/business-users/${id}`, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-users', bid] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setEditingId(null)
    },
  })

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault()
    setCreateError('')
    createUserMutation.mutate({
      fullName: newFullName, email: newEmail, password: newPassword, sendEmail,
      ...(isSuperAdmin && currentBusiness?.organizationId ? { organizationId: currentBusiness.organizationId } : {}),
    } as Parameters<typeof createUserMutation.mutate>[0])
  }

  const handleAssignSubmit = (e: FormEvent) => {
    e.preventDefault()
    assignMutation.mutate({ businessId: Number(assignBusinessId), userId: Number(userId), roleId: Number(roleId) })
  }

  if (!bid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-5">
        <Icon name="users" size={28} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Aucun business sélectionné</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un business pour gérer votre équipe.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const members = businessUsers ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Équipe</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentBusiness?.name} · {members.length} membre{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(true)}>
            <Icon name="plus" size={15} className="mr-1" /> Assigner
          </Button>
          <Button size="sm" onClick={() => { setCreateError(''); setShowCreateModal(true) }}>
            <Icon name="plus" size={15} className="mr-1" /> Créer un utilisateur
          </Button>
        </div>
      </div>

      {/* Team cards */}
      {members.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(bu => {
            const roleName = bu.role?.name ?? ''
            const roleLabel = bu.role?.displayName || bu.role?.name || `Rôle #${bu.roleId}`
            const colorClass = ROLE_COLORS[roleName] ?? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            return (
              <div key={bu.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 flex flex-col gap-3">
                {/* Avatar + info */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(bu.userId)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {getInitials(bu.user?.fullName, bu.user?.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {bu.user?.fullName || `Utilisateur #${bu.userId}`}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{bu.user?.email}</p>
                  </div>
                  <Badge variant={bu.isActive ? 'success' : 'default'} dot>{bu.isActive ? 'Actif' : 'Inactif'}</Badge>
                </div>

                {/* Role */}
                {editingId === bu.id ? (
                  <div className="flex gap-2">
                    <select
                      value={editRoleId}
                      onChange={e => setEditRoleId(e.target.value)}
                      className="flex-1 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emi-violet"
                    >
                      {roles?.map(r => <option key={r.id} value={String(r.id)}>{r.displayName}</option>)}
                    </select>
                    <Button size="sm" loading={updateRoleMutation.isPending} onClick={() => updateRoleMutation.mutate({ id: bu.id, roleId: Number(editRoleId) })}>
                      OK
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>✕</Button>
                  </div>
                ) : (
                  <span className={`inline-flex self-start px-2.5 py-1 rounded-lg text-xs font-semibold ${colorClass}`}>
                    {roleLabel}
                  </span>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => { setEditingId(bu.id); setEditRoleId(String(bu.roleId)) }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Icon name="edit" size={12} /> Changer le rôle
                  </button>
                  <button
                    onClick={() => { if (window.confirm('Retirer cet utilisateur ?')) deleteMutation.mutate(bu.id) }}
                    className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors"
                    title="Retirer"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
            <Icon name="users" size={26} />
          </div>
          <p className="text-sm text-zinc-400">Aucun membre dans ce business.</p>
        </div>
      )}

      {/* Create user modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer un utilisateur">
        <form onSubmit={handleCreateUser} className="space-y-3">
          {createError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {createError}
            </div>
          )}
          <Input label="Nom complet" value={newFullName} onChange={e => setNewFullName(e.target.value)} placeholder="Jean Dupont" required />
          <Input label="Email *" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@exemple.com" required />
          <Input label="Mot de passe *" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 caractères" autoComplete="new-password" required />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={e => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-emi-violet focus:ring-emi-violet/30"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Envoyer les identifiants par email</span>
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={createUserMutation.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>

      {/* Assign user modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assigner un utilisateur">
        <form onSubmit={handleAssignSubmit} className="space-y-3">
          <Select
            label="Business"
            value={assignBusinessId}
            onChange={e => setAssignBusinessId(e.target.value)}
            options={allBusinesses?.map(b => ({ value: String(b.id), label: b.name })) || []}
            placeholder="Sélectionner un business…"
            required
          />
          <Select
            label="Utilisateur"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            options={allUsers?.map(u => ({ value: String(u.id), label: u.fullName || u.email })) || []}
            placeholder="Sélectionner un utilisateur…"
            required
          />
          <Select
            label="Rôle"
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            options={roles?.map(r => ({ value: String(r.id), label: r.displayName })) || []}
            placeholder="Sélectionner un rôle…"
            required
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)} className="flex-1">Annuler</Button>
            <Button type="submit" className="flex-1" loading={assignMutation.isPending} disabled={!userId || !assignBusinessId || !roleId}>
              Assigner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
