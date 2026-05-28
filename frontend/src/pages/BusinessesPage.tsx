import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import api from '../services/api'
import type { Business } from '../types'

const CURRENCIES = [
  { value: 'USD', label: 'USD — Dollar américain' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'CDF', label: 'CDF — Franc congolais' },
  { value: 'XAF', label: 'XAF — Franc CFA' },
  { value: 'GBP', label: 'GBP — Livre sterling' },
]

export function BusinessesPage() {
  const queryClient = useQueryClient()

  const [name, setName]         = useState('')
  const [type, setType]         = useState('standard')
  const [currency, setCurrency] = useState('USD')
  const [address, setAddress]   = useState('')
  const [phone, setPhone]       = useState('')
  const [error, setError]       = useState('')

  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ['businesses'],
    queryFn: async () => (await api.get('/businesses')).data,
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/businesses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      resetForm()
      setError('')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string; errors?: { message: string }[] } } }
      setError(e.response?.data?.error || e.response?.data?.errors?.[0]?.message || 'Échec de la création.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/businesses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businesses'] }),
  })

  const resetForm = () => {
    setName(''); setType('standard'); setCurrency('USD'); setAddress(''); setPhone('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    createMutation.mutate({
      name,
      type,
      supportsRotations: type === 'rotation',
      currency,
      address: address || undefined,
      phone: phone || undefined,
    })
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Businesses</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {businesses?.length ?? 0} business{(businesses?.length ?? 0) !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Nouveau business</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <Input label="Nom *" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Mon Business" />
              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'rotation', label: 'Rotation' },
                ]}
              />
              <Select
                label="Devise"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={CURRENCIES}
              />
              <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rue, Ville, Pays" />
              <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+XXX XX XX XX XX" />
              <Button type="submit" className="w-full" loading={createMutation.isPending}>
                Créer le business
              </Button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {businesses?.length ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {businesses.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emi-violet to-emi-violet-dark flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{b.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-zinc-400 capitalize">{b.type}</span>
                        <span className="text-xs text-zinc-400">·</span>
                        <span className="text-xs text-zinc-400">{b.currency}</span>
                        {b.supportsRotations && (
                          <>
                            <span className="text-xs text-zinc-400">·</span>
                            <span className="text-xs text-emi-violet">Rotations</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={b.isActive ? 'success' : 'default'} dot>
                      {b.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <button
                      onClick={() => { if (window.confirm(`Supprimer "${b.name}" ?`)) deleteMutation.mutate(b.id) }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      title="Supprimer"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-emi-violet mb-4">
                  <Icon name="businesses" size={26} />
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Aucun business. Créez le premier.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
