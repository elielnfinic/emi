import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Supplier } from '../types'

export function SuppliersPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers', bid],
    queryFn: async () => (await api.get('/suppliers', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/suppliers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', bid] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/suppliers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers', bid] }),
  })

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
    setNotes('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid,
      name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      notes: notes || undefined,
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this supplier?')) deleteMutation.mutate(id)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🏭</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to manage suppliers.</p>
    </div>
  )
  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Supplier</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Supplier name" />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, Country" />
              <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
              <Button type="submit" className="w-full" loading={createMutation.isPending}>Add Supplier</Button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.length ? data.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-gray-500">{s.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{s.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{s.address || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-4xl mb-2">🏭</div>
                        <p className="text-gray-500">No suppliers yet. Add your first supplier.</p>
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
