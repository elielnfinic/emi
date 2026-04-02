import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import api from '../services/api'
import type { Business, Organization } from '../types'

export function BusinessesPage() {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [type, setType] = useState('standard')
  const [currency, setCurrency] = useState('USD')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const queryClient = useQueryClient()

  const { data: orgs } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => (await api.get('/organizations')).data,
  })

  const orgId = orgs?.[0]?.id

  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ['businesses', orgId],
    queryFn: async () => (await api.get('/businesses', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/businesses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/businesses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['businesses'] }),
  })

  const resetForm = () => {
    setShowModal(false)
    setName('')
    setOrganizationId('')
    setType('standard')
    setCurrency('USD')
    setAddress('')
    setPhone('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      organizationId: Number(organizationId) || orgId,
      name,
      type,
      currency,
      address: address || undefined,
      phone: phone || undefined,
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <Loader />

  if (!orgs?.length) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🏛️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No organizations yet</h2>
        <p className="text-gray-500">Create an organization first, then add businesses.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Businesses</h1>
        <Button onClick={() => setShowModal(true)}>+ New Business</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {businesses?.length ? businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                <td className="px-6 py-4 text-gray-500 capitalize">{b.type}</td>
                <td className="px-6 py-4 text-gray-500">{b.currency}</td>
                <td className="px-6 py-4">
                  <Badge variant={b.isActive ? 'success' : 'default'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="danger" size="sm" onClick={() => handleDelete(b.id)}>Delete</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-4xl mb-2">🏢</div>
                  <p className="text-gray-500">No businesses yet. Create your first business.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={resetForm} title="New Business">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="My Business" />
          {orgs && orgs.length > 1 && (
            <Select
              label="Organization"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              options={orgs.map(o => ({ value: String(o.id), label: o.name }))}
              placeholder="Select organization"
            />
          )}
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
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'CDF', label: 'CDF' },
            ]}
          />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Business</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
