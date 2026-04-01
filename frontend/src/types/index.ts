export interface User {
  id: number
  fullName: string | null
  email: string
  initials: string
  organizationId: number | null
  roleId: number | null
  createdAt: string
  updatedAt: string | null
}

export interface Organization {
  id: number
  name: string
  slug: string
  logoUrl: string | null
  createdAt: string
  updatedAt: string | null
}

export interface Business {
  id: number
  organizationId: number
  name: string
  slug: string
  type: string
  supportsRotations: boolean
  currency: string
  address: string | null
  phone: string | null
  isActive: boolean
  organization?: Organization
  createdAt: string
  updatedAt: string | null
}

export interface TransactionCategory {
  id: number
  businessId: number
  name: string
  type: 'income' | 'expense'
  description: string | null
  isDefault: boolean
}

export interface Transaction {
  id: number
  businessId: number
  categoryId: number | null
  userId: number
  reference: string
  type: 'income' | 'expense'
  amount: number
  description: string | null
  beneficiary: string | null
  date: string
  category?: TransactionCategory
  user?: User
  createdAt: string
  updatedAt: string | null
}

export interface StockItem {
  id: number
  businessId: number
  name: string
  sku: string | null
  description: string | null
  unit: string
  purchasePrice: number | null
  sellingPrice: number | null
  quantity: number
  minQuantity: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface Customer {
  id: number
  businessId: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string | null
}

export interface Supplier {
  id: number
  businessId: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string | null
}

export interface SaleItem {
  id: number
  saleId: number
  stockItemId: number | null
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SalePayment {
  id: number
  saleId: number
  amount: number
  paymentMethod: string
  reference: string | null
  date: string
  notes: string | null
}

export interface Sale {
  id: number
  businessId: number
  customerId: number | null
  userId: number
  reference: string
  type: 'cash' | 'credit'
  status: string
  totalAmount: number
  paidAmount: number
  date: string
  notes: string | null
  customer?: Customer
  user?: User
  items?: SaleItem[]
  payments?: SalePayment[]
  createdAt: string
  updatedAt: string | null
}

export interface DashboardData {
  kpis: {
    totalIncome: number
    totalExpense: number
    balance: number
    todaySalesTotal: number
    todaySalesCount: number
    monthSalesTotal: number
    monthSalesCount: number
    lowStockCount: number
    totalCustomers: number
  }
  recentTransactions: Transaction[]
  recentSales: Sale[]
}

export interface AuthResponse {
  user: User
  token: string
}
