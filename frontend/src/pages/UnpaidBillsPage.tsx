import { useState, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { Sale, PaginatedResponse } from '../types'

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

function daysSince(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000)
}

export function UnpaidBillsPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const cur = currentBusiness?.currency || 'USD'
  const queryClient = useQueryClient()

  const [paymentPanelId, setPaymentPanelId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payDate, setPayDate] = useState('')
  const [payNotes, setPayNotes] = useState('')

  const { data: salesPage, isLoading } = useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', bid, 'unpaid'],
    queryFn: async () =>
      (await api.get('/sales', { params: { business_id: bid, type: 'credit', status: 'pending', per_page: 200 } })).data,
    enabled: !!bid,
  })
  const sales = salesPage?.data

  const addPaymentMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/sales/payments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', bid, 'unpaid'], exact: true, refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['sales', bid] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', bid] })
      setPaymentPanelId(null)
      setPayAmount('')
      setPayNotes('')
    },
  })

  const openPanel = (sale: Sale) => {
    const actualPaid = sale.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? Number(sale.paidAmount)
    const remaining = Number(sale.totalAmount) - actualPaid
    setPaymentPanelId(sale.id)
    setPayAmount(remaining > 0 ? String(Number(remaining.toFixed(2))) : '')
    setPayMethod('cash')
    setPayDate(new Date().toISOString().split('T')[0])
    setPayNotes('')
  }

  if (!bid) return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mb-4">
        <Icon name="debt" size={28} />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No business selected</h2>
      <p className="text-gray-500">Select a business to view unpaid bills.</p>
    </div>
  )
  if (isLoading) return <Loader />

  const totalOutstanding = sales?.reduce((sum, s) => {
    const paid = s.payments?.reduce((a, p) => a + Number(p.amount), 0) ?? Number(s.paidAmount)
    return sum + (Number(s.totalAmount) - paid)
  }, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unpaid Bills</h1>
          <p className="text-sm text-gray-500 mt-1">Outstanding credit sales awaiting payment</p>
        </div>
        {sales && sales.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-right">
            <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">{fmt(totalOutstanding, cur)}</p>
            <p className="text-xs text-red-400">{sales.length} unpaid sale{sales.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {!sales?.length ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 text-green-500 mb-4">
            <Icon name="debt" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">All clear!</h2>
          <p className="text-gray-500">No outstanding unpaid bills.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((s) => {
                const actualPaid = s.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? Number(s.paidAmount)
                const remaining = Number(s.totalAmount) - actualPaid
                const paidPct = s.totalAmount > 0 ? Math.min(100, Math.round((actualPaid / Number(s.totalAmount)) * 100)) : 0
                const days = daysSince(String(s.date))
                const isOpen = paymentPanelId === s.id
                return (
                  <Fragment key={s.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.reference}</td>
                      <td className="px-6 py-4 text-gray-700">{s.customer?.name || 'Walk-in'}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span>{String(s.date)}</span>
                        {days > 0 && (
                          <span className={`ml-2 text-xs font-medium ${days > 30 ? 'text-red-500' : days > 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                            {days}d ago
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{fmt(Number(s.totalAmount), cur)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-gray-700">{fmt(actualPaid, cur)}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                            <div className="bg-emi-violet h-1 rounded-full" style={{ width: `${paidPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-600">{fmt(remaining, cur)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={isOpen ? 'secondary' : 'primary'}
                          onClick={() => isOpen ? setPaymentPanelId(null) : openPanel(s)}
                        >
                          {isOpen ? 'Close' : 'Pay'}
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-blue-50/40">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Paid: <strong className="text-gray-800">{fmt(actualPaid, cur)}</strong></span>
                                <span>Total: <strong className="text-gray-800">{fmt(Number(s.totalAmount), cur)}</strong></span>
                                <span className="text-red-600 font-medium">Remaining: {fmt(remaining, cur)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-emi-violet h-2 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{paidPct}% paid</p>
                            </div>

                            {s.payments && s.payments.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment history</p>
                                <div className="space-y-1">
                                  {s.payments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                                      <div className="flex items-center gap-3">
                                        <span className="text-gray-400 text-xs">{p.date}</span>
                                        <Badge variant="info">{p.paymentMethod.replace('_', ' ')}</Badge>
                                        {p.notes && <span className="text-gray-400 text-xs italic">{p.notes}</span>}
                                      </div>
                                      <span className="font-semibold text-emi-green">+{fmt(Number(p.amount), cur)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add a tranche</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Amount"
                                  value={payAmount}
                                  onChange={(e) => setPayAmount(e.target.value)}
                                  min={0.01}
                                />
                                <Select
                                  value={payMethod}
                                  onChange={(e) => setPayMethod(e.target.value)}
                                  options={[
                                    { value: 'cash', label: 'Cash' },
                                    { value: 'transfer', label: 'Transfer' },
                                    { value: 'mobile_money', label: 'Mobile Money' },
                                  ]}
                                />
                                <Input
                                  type="date"
                                  value={payDate}
                                  onChange={(e) => setPayDate(e.target.value)}
                                />
                                <Input
                                  placeholder="Notes (optional)"
                                  value={payNotes}
                                  onChange={(e) => setPayNotes(e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                className="mt-2"
                                size="sm"
                                loading={addPaymentMutation.isPending}
                                disabled={!payAmount || Number(payAmount) <= 0}
                                onClick={() =>
                                  addPaymentMutation.mutate({
                                    saleId: s.id,
                                    amount: Number(payAmount),
                                    paymentMethod: payMethod,
                                    date: payDate,
                                    notes: payNotes || undefined,
                                  })
                                }
                              >
                                Record Payment
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
