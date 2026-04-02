import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { BusinessUser, User } from '../types'

const ROLES = [
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Manager' },
  { value: '3', label: 'Cashier' },
  { value: '4', label: 'Stock' },
]

export function UsersPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [userId, setUserId] = useState('')
  const [roleId, setRoleId] = useState('3')

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

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/business-users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-users', bid] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/business-users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-users', bid] }),
  })

  const resetForm = () => {
    setUserId('')
    setRoleId('3')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid,
      userId: Number(userId),
      roleId: Number(roleId),
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Remove this user from the business?')) deleteMutation.mutate(id)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emi-violet-light text-emi-violet mb-4">
        <Icon name="users" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to manage your team.</p>
    </div>
  )
  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add User to Business</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select
                label="User"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                options={allUsers?.map((u) => ({ value: String(u.id), label: u.fullName || u.email })) || []}
                placeholder="Select a user..."
                required
              />
              <Select
                label="Role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                options={ROLES}
              />
              <Button type="submit" className="w-full" loading={createMutation.isPending} disabled={!userId}>
                Add User
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {businessUsers?.length ? businessUsers.map((bu) => (
                    <tr key={bu.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{bu.user?.fullName || `User #${bu.userId}`}</td>
                      <td className="px-6 py-4 text-gray-500">{bu.user?.email || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{bu.role?.displayName || bu.role?.name || `Role #${bu.roleId}`}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={bu.isActive ? 'success' : 'default'}>{bu.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(bu.id)}>Remove</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-violet-light text-emi-violet mb-2">
                          <Icon name="users" size={24} />
                        </div>
                        <p className="text-gray-500">No team members assigned. Add your first user.</p>
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
