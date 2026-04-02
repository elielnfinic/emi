import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Customer, PaginatedResponse } from '../types'

export function CustomersPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers', bid, search, page],
    queryFn: async () => (await api.get('/customers', { params: { business_id: bid, search, page } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/customers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', bid] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers', bid] }),
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
    if (window.confirm('Delete this customer?')) deleteMutation.mutate(id)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emi-green-light text-emi-green mb-4">
        <Icon name="customers" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to manage customers.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const customers = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Customer name" />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, Country" />
              <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
              <Button type="submit" className="w-full" loading={createMutation.isPending}>Add Customer</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <Input
                placeholder="Search by name, email or phone…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
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
                  {customers.length ? customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link to={`/customers/${c.id}`} className="text-emi-violet hover:underline">{c.name}</Link>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{c.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{c.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{c.address || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emi-green-light text-emi-green mb-2">
                          <Icon name="customers" size={24} />
                        </div>
                        <p className="text-gray-500">{search ? 'No customers match your search.' : 'No customers yet. Add your first customer.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </div>
        </div>
      </div>
    </div>
  )
}
