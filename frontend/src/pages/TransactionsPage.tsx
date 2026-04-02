import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Transaction } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

export function TransactionsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', bid],
    queryFn: async () => (await api.get('/transactions', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
    },
  })

  const resetForm = () => {
    setShowModal(false)
    setType('income')
    setAmount('')
    setDescription('')
    setBeneficiary('')
    setDate('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      businessId: bid,
      type,
      amount: Number(amount),
      description: description || undefined,
      beneficiary: beneficiary || undefined,
      date: date || undefined,
    })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this transaction?')) deleteMutation.mutate(id)
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">💰</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to view transactions.</p>
    </div>
  )
  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <Button onClick={() => setShowModal(true)}>+ New Transaction</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.length ? data.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{tx.reference}</td>
                <td className="px-6 py-4"><Badge variant={tx.type === 'income' ? 'success' : 'danger'}>{tx.type}</Badge></td>
                <td className={`px-6 py-4 font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount, cur)}
                </td>
                <td className="px-6 py-4 text-gray-500">{tx.description || '-'}</td>
                <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="danger" size="sm" onClick={() => handleDelete(tx.id)}>Delete</Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <p className="text-gray-500">No transactions yet. Add your first transaction.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={resetForm} title="New Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ]}
          />
          <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Rent, salary, etc." />
          <Input label="Beneficiary" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="John Doe" />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create Transaction</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
