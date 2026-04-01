import { useQuery } from '@tanstack/react-query'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import { useAppStore } from '../stores'
import api from '../services/api'
import type { StockItem } from '../types'

export function StockPage() {
  const { currentBusiness } = useAppStore()
  const bid = currentBusiness?.id
  const { data, isLoading } = useQuery<StockItem[]>({
    queryKey: ['stock-items', bid],
    queryFn: async () => (await api.get('/stock-items', { params: { business_id: bid } })).data,
    enabled: !!bid,
  })
  if (!bid) return <p className="text-gray-500 py-8 text-center">Select a business first</p>
  if (isLoading) return <Loader />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Stock</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {data?.length ? data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-500">{item.sku || '-'}</td>
                <td className={`px-6 py-4 font-medium ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</td>
                <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 text-gray-900">{item.sellingPrice != null ? `$${item.sellingPrice}` : '-'}</td>
                <td className="px-6 py-4">{item.quantity <= item.minQuantity ? <Badge variant="danger">Low stock</Badge> : <Badge variant="success">In stock</Badge>}</td>
              </tr>
            )) : <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No stock items</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
