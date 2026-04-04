import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores'
import { Icon } from '../components/ui/Icon'
import api from '../services/api'

type Tab = 'profile' | 'password' | 'email' | 'users'

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 focus:border-emi-violet/50 transition"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        tabIndex={-1}
      >
        <Icon name={show ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
        type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400'
      }`}
    >
      <Icon name={type === 'success' ? 'check' : 'alert'} size={15} />
      <span>{message}</span>
    </div>
  )
}

function ProfileTab() {
  const { user, setUser } = useAuthStore()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const mutation = useMutation({
    mutationFn: () => api.put('/account/profile', { fullName }),
    onSuccess: (res) => {
      const data = res.data?.data ?? res.data
      if (user) setUser({ ...user, fullName: data.fullName ?? fullName })
      setResult({ message: 'Profil mis à jour avec succès', type: 'success' })
    },
    onError: (err: any) => {
      setResult({ message: err?.response?.data?.message ?? 'Une erreur est survenue', type: 'error' })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setResult(null)
        mutation.mutate()
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="fullName" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          Nom complet
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Votre nom"
          className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 focus:border-emi-violet/50 transition"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={user?.email ?? ''}
          disabled
          className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/40 text-sm text-zinc-400 cursor-not-allowed"
        />
        <p className="mt-1.5 text-xs text-zinc-400">Pour changer votre email, utilisez l'onglet <strong>Email</strong>.</p>
      </div>
      {result && <Toast message={result.message} type={result.type} />}
      <button
        type="submit"
        disabled={mutation.isPending || !fullName.trim()}
        className="w-full py-2.5 px-4 rounded-xl bg-emi-violet text-white text-sm font-semibold hover:bg-emi-violet-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const mutation = useMutation({
    mutationFn: () => api.put('/account/password', { currentPassword, newPassword }),
    onSuccess: () => {
      setResult({ message: 'Mot de passe mis à jour avec succès', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: any) => {
      setResult({ message: err?.response?.data?.message ?? 'Une erreur est survenue', type: 'error' })
    },
  })

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const canSubmit = currentPassword && newPassword.length >= 8 && newPassword === confirmPassword

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setResult(null)
        mutation.mutate()
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="currentPassword" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          Mot de passe actuel
        </label>
        <PasswordInput id="currentPassword" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          Nouveau mot de passe
        </label>
        <PasswordInput id="newPassword" value={newPassword} onChange={setNewPassword} placeholder="Minimum 8 caractères" />
        {newPassword.length > 0 && newPassword.length < 8 && (
          <p className="mt-1.5 text-xs text-amber-500">Au moins 8 caractères requis</p>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
          Confirmer le nouveau mot de passe
        </label>
        <PasswordInput id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
        {mismatch && <p className="mt-1.5 text-xs text-red-500">Les mots de passe ne correspondent pas</p>}
      </div>
      {result && <Toast message={result.message} type={result.type} />}
      <button
        type="submit"
        disabled={mutation.isPending || !canSubmit}
        className="w-full py-2.5 px-4 rounded-xl bg-emi-violet text-white text-sm font-semibold hover:bg-emi-violet-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? 'Mise à jour…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}

function EmailTab() {
  const { user, setUser } = useAuthStore()
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const requestMutation = useMutation({
    mutationFn: () => api.post('/account/email/request', { newEmail }),
    onSuccess: (res) => {
      const data = res.data?.data ?? res.data
      setResult({ message: data.message ?? 'Code envoyé', type: 'success' })
      setStep('verify')
    },
    onError: (err: any) => {
      setResult({ message: err?.response?.data?.message ?? 'Une erreur est survenue', type: 'error' })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: () => api.post('/account/email/verify', { otp }),
    onSuccess: (res) => {
      const data = res.data?.data ?? res.data
      if (user) setUser({ ...user, email: data.email ?? newEmail })
      setResult({ message: 'Email mis à jour avec succès', type: 'success' })
      setStep('request')
      setNewEmail('')
      setOtp('')
    },
    onError: (err: any) => {
      setResult({ message: err?.response?.data?.message ?? 'Code incorrect', type: 'error' })
    },
  })

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/40 text-sm">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Email actuel</p>
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</p>
      </div>

      {step === 'request' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setResult(null)
            requestMutation.mutate()
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="newEmail" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Nouvel email
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nouvelle@adresse.com"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 focus:border-emi-violet/50 transition"
            />
          </div>
          {result && <Toast message={result.message} type={result.type} />}
          <button
            type="submit"
            disabled={requestMutation.isPending || !newEmail.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-emi-violet text-white text-sm font-semibold hover:bg-emi-violet-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requestMutation.isPending ? 'Envoi…' : 'Envoyer le code de vérification'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setResult(null)
            verifyMutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
            <Icon name="mail" size={14} className="mt-0.5 shrink-0" />
            <span>Un code à 6 chiffres a été envoyé à <strong>{newEmail}</strong>. Il expire dans 15 minutes.</span>
          </div>
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Code de vérification
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 focus:border-emi-violet/50 transition text-center tracking-[0.4em] font-mono text-lg"
            />
          </div>
          {result && <Toast message={result.message} type={result.type} />}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep('request'); setResult(null); setOtp('') }}
              className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={verifyMutation.isPending || otp.length !== 6}
              className="flex-2 flex-1 py-2.5 px-4 rounded-xl bg-emi-violet text-white text-sm font-semibold hover:bg-emi-violet-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? 'Vérification…' : 'Confirmer'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

interface UserItem {
  id: number
  fullName: string | null
  email: string
  role: string | null
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserItem
  onClose: () => void
  onSaved: () => void
}) {
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, string> = { fullName, email }
      if (password) payload.password = password
      return api.put(`/admin/users/${user.id}`, payload)
    },
    onSuccess: () => {
      onSaved()
      onClose()
    },
    onError: (err: any) => {
      setResult({ message: err?.response?.data?.message ?? 'Une erreur est survenue', type: 'error' })
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-700/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Modifier l'utilisateur</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <Icon name="x" size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setResult(null); mutation.mutate() }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Nouveau mot de passe <span className="text-zinc-400 normal-case font-normal">(laisser vide pour ne pas changer)</span>
            </label>
            <PasswordInput id={`pwd-${user.id}`} value={password} onChange={setPassword} placeholder="Minimum 8 caractères" />
          </div>
          {result && <Toast message={result.message} type={result.type} />}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emi-violet text-white text-sm font-semibold hover:bg-emi-violet-dark transition disabled:opacity-50"
            >
              {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AdminUsersTab() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<UserItem | null>(null)

  const { data: users = [], isLoading } = useQuery<UserItem[]>({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const res = await api.get('/business-users/users', { params: { search } })
      return res.data?.data ?? res.data ?? []
    },
    staleTime: 10_000,
  })

  const [localSearch, setLocalSearch] = useState('')

  const filtered = users.filter((u) => {
    const q = localSearch.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Rechercher un utilisateur…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emi-violet/40 transition"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-emi-violet border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-zinc-400 py-8">Aucun utilisateur trouvé</p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700/60 overflow-hidden">
          {filtered.map((u) => {
            const initials = u.fullName
              ? u.fullName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
              : u.email.charAt(0).toUpperCase()
            return (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emi-violet to-emi-violet-dark text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {u.fullName || u.email}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                </div>
                {u.role && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emi-violet/10 text-emi-violet shrink-0">
                    {u.role}
                  </span>
                )}
                <button
                  onClick={() => setEditing(u)}
                  className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-emi-violet hover:bg-emi-violet/10 transition-colors"
                >
                  <Icon name="edit" size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
        />
      )}
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profil', icon: 'users' },
  { id: 'password', label: 'Mot de passe', icon: 'shield' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'users', label: 'Utilisateurs', icon: 'users' },
]

export function SettingsPage() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const visibleTabs = TABS.filter((t) => t.id !== 'users' || isSuperAdmin)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Paramètres</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Icon name={tab.icon} size={13} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 p-6">
        {/* Tab title */}
        <div className="mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {visibleTabs.find((t) => t.id === activeTab)?.label}
          </h2>
        </div>

        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'password' && <PasswordTab />}
        {activeTab === 'email' && <EmailTab />}
        {activeTab === 'users' && isSuperAdmin && <AdminUsersTab />}
      </div>
    </div>
  )
}
