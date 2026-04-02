import Transaction from '#models/transaction'
import Sale from '#models/sale'
import StockItem from '#models/stock_item'
import Customer from '#models/customer'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class DashboardController {
  async show(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    if (!businessId) {
      return { error: 'business_id is required' }
    }

    await verifyBusinessAccess(ctx, businessId)

    const today = DateTime.now().toISODate()
    const startOfMonth = DateTime.now().startOf('month').toISODate()

    const [
      totalIncome,
      totalExpense,
      todaySales,
      monthSales,
      lowStockItems,
      totalCustomers,
      recentTransactions,
      recentSales,
    ] = await Promise.all([
      Transaction.query()
        .where('businessId', businessId)
        .where('type', 'income')
        .sum('amount as total')
        .first(),
      Transaction.query()
        .where('businessId', businessId)
        .where('type', 'expense')
        .sum('amount as total')
        .first(),
      Sale.query()
        .where('businessId', businessId)
        .where('date', today!)
        .sum('total_amount as total')
        .count('* as count')
        .first(),
      Sale.query()
        .where('businessId', businessId)
        .where('date', '>=', startOfMonth!)
        .sum('total_amount as total')
        .count('* as count')
        .first(),
      StockItem.query()
        .where('businessId', businessId)
        .where('isActive', true)
        .whereRaw('quantity <= min_quantity')
        .count('* as total')
        .first(),
      Customer.query()
        .where('businessId', businessId)
        .count('* as total')
        .first(),
      Transaction.query()
        .where('businessId', businessId)
        .preload('category')
        .orderBy('date', 'desc')
        .limit(5),
      Sale.query()
        .where('businessId', businessId)
        .preload('customer')
        .orderBy('date', 'desc')
        .limit(5),
    ])

    return {
      kpis: {
        totalIncome: Number(totalIncome?.$extras.total || 0),
        totalExpense: Number(totalExpense?.$extras.total || 0),
        balance: Number(totalIncome?.$extras.total || 0) - Number(totalExpense?.$extras.total || 0),
        todaySalesTotal: Number(todaySales?.$extras.total || 0),
        todaySalesCount: Number(todaySales?.$extras.count || 0),
        monthSalesTotal: Number(monthSales?.$extras.total || 0),
        monthSalesCount: Number(monthSales?.$extras.count || 0),
        lowStockCount: Number(lowStockItems?.$extras.total || 0),
        totalCustomers: Number(totalCustomers?.$extras.total || 0),
      },
      recentTransactions,
      recentSales,
    }
  }
}
