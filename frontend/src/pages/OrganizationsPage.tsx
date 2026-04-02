import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Loader } from '../components/ui/Loader'
import api from '../services/api'
import type { Organization } from '../types'

export function OrganizationsPage() {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const queryClient = useQueryClient()

  const { data: orgs, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => (await api.get('/organizations')).data,
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => api.post('/organizations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/organizations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  })

  const resetForm = () => {
    setShowModal(false)
    setName('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this organization? All related data will be lost.')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <Button onClick={() => setShowModal(true)}>+ New Organization</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orgs?.length ? orgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{org.name}</td>
                <td className="px-6 py-4 text-gray-500">{org.slug}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="danger" size="sm" onClick={() => handleDelete(org.id)}>Delete</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="text-4xl mb-2">🏛️</div>
                  <p className="text-gray-500">No organizations yet. Create your first organization.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={resetForm} title="New Organization">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="My Organization" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Organization</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
