import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Rotation } from '../types'

export function RotationsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
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
    },
  })

  const closeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/rotations/${id}/close`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rotations', bid] }),
  })

  const resetForm = () => {
    setName('')
    setStartDate('')
    setInitialCapital('')
    setNotes('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid,
      name,
      startDate: startDate || undefined,
      initialCapital: initialCapital ? Number(initialCapital) : 0,
      notes: notes || undefined,
    })
  }

  const handleClose = (id: number) => {
    if (window.confirm('Close this rotation?')) closeMutation.mutate(id)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emi-violet-light text-emi-violet mb-4">
        <Icon name="rotations" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to manage rotations.</p>
    </div>
  )
  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rotations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Rotation</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rotation name" />
              <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="Initial Capital" type="number" step="0.01" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} placeholder="0.00" />
              <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
              <Button type="submit" className="w-full" loading={createMutation.isPending}>Start Rotation</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capital</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.length ? data.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant={r.status === 'active' ? 'success' : r.status === 'closed' ? 'default' : 'warning'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{r.startDate}</td>
                      <td className="px-6 py-4 text-gray-500">{r.endDate || '-'}</td>
                      <td className="px-6 py-4 text-gray-900">{r.initialCapital}</td>
                      <td className="px-6 py-4 text-right">
                        {r.status === 'active' && (
                          <Button variant="secondary" size="sm" onClick={() => handleClose(r.id)} loading={closeMutation.isPending}>
                            Close
                          </Button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                          <Icon name="rotations" size={24} />
                        </div>
                        <p className="text-gray-500">No rotations yet. Start your first rotation.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
