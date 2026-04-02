import Transaction from '#models/transaction'
import Sale from '#models/sale'
import StockItem from '#models/stock_item'
import type { HttpContext } from '@adonisjs/core/http'

export default class ReportsController {
  async salesReport({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const from = request.input('from')
    const to = request.input('to')

    const query = Sale.query()
      .where('businessId', businessId)
      .preload('customer')
      .preload('items')

    if (from) query.where('date', '>=', from)
    if (to) query.where('date', '<=', to)

    const sales = await query.orderBy('date', 'desc')

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalPaid = sales.reduce((sum, s) => sum + s.paidAmount, 0)
    const cashSales = sales.filter((s) => s.type === 'cash')
    const creditSales = sales.filter((s) => s.type === 'credit')

    return {
      summary: {
        totalSales,
        totalPaid,
        totalUnpaid: totalSales - totalPaid,
        count: sales.length,
        cashCount: cashSales.length,
        creditCount: creditSales.length,
        cashTotal: cashSales.reduce((sum, s) => sum + s.totalAmount, 0),
        creditTotal: creditSales.reduce((sum, s) => sum + s.totalAmount, 0),
      },
      sales,
    }
  }

  async transactionsReport({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const from = request.input('from')
    const to = request.input('to')

    const query = Transaction.query()
      .where('businessId', businessId)
      .preload('category')

    if (from) query.where('date', '>=', from)
    if (to) query.where('date', '<=', to)

    const transactions = await query.orderBy('date', 'desc')

    const income = transactions.filter((t) => t.type === 'income')
    const expense = transactions.filter((t) => t.type === 'expense')

    return {
      summary: {
        totalIncome: income.reduce((sum, t) => sum + t.amount, 0),
        totalExpense: expense.reduce((sum, t) => sum + t.amount, 0),
        balance:
          income.reduce((sum, t) => sum + t.amount, 0) -
          expense.reduce((sum, t) => sum + t.amount, 0),
        incomeCount: income.length,
        expenseCount: expense.length,
      },
      transactions,
    }
  }

  async stockReport({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const items = await StockItem.query()
      .where('businessId', businessId)
      .orderBy('name', 'asc')

    const totalValue = items.reduce((sum, i) => sum + i.quantity * (i.sellingPrice || 0), 0)
    const lowStock = items.filter((i) => i.quantity <= i.minQuantity)

    return {
      summary: {
        totalItems: items.length,
        totalValue,
        lowStockCount: lowStock.length,
      },
      items,
      lowStockItems: lowStock,
    }
  }
}
