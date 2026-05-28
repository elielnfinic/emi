import Transaction from '#models/transaction'
import Sale from '#models/sale'
import StockItem from '#models/stock_item'
import Rotation from '#models/rotation'
import Customer from '#models/customer'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class DashboardController {
  async show(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    if (!businessId) {
      return { error: 'business_id is required' }
    }

    await verifyBusinessAccess(ctx, businessId)

    const today = DateTime.now().toISODate()
    const startOfMonth = DateTime.now().startOf('month').toISODate()
    const sixMonthsAgo = DateTime.now().minus({ months: 5 }).startOf('month').toISODate()

    const [
      totalIncome,
      totalExpense,
      todaySales,
      monthSales,
      monthIncome,
      monthExpense,
      lowStockItems,
      totalCustomers,
      recentTransactions,
      recentSales,
      activeRotation,
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
      Transaction.query()
        .where('businessId', businessId)
        .where('type', 'income')
        .where('date', '>=', startOfMonth!)
        .sum('amount as total')
        .first(),
      Transaction.query()
        .where('businessId', businessId)
        .where('type', 'expense')
        .where('date', '>=', startOfMonth!)
        .sum('amount as total')
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
      Rotation.query()
        .where('businessId', businessId)
        .where('status', 'active')
        .first(),
    ])

    // 6-month breakdown: group all transactions by month and type
    const monthlyRows = await db.rawQuery(
      `SELECT TO_CHAR(date, 'YYYY-MM') AS month, type, SUM(amount)::float AS total
       FROM transactions
       WHERE business_id = ? AND date >= ?
       GROUP BY 1, 2
       ORDER BY 1 ASC`,
      [businessId, sixMonthsAgo]
    )

    const monthlyMap: Record<string, { income: number; expense: number }> = {}
    for (const row of monthlyRows.rows as { month: string; type: string; total: number }[]) {
      if (!monthlyMap[row.month]) monthlyMap[row.month] = { income: 0, expense: 0 }
      if (row.type === 'income') monthlyMap[row.month].income = Number(row.total)
      else monthlyMap[row.month].expense = Number(row.total)
    }
    const monthlyBreakdown = Object.entries(monthlyMap).map(([month, v]) => ({
      month,
      income: v.income,
      expense: v.expense,
      profit: v.income - v.expense,
    }))

    // Active rotation P&L (mirrors RotationDetailPage logic: exclude sale: auto-transactions, add sales directly)
    let activeRotationKpis: {
      rotationId: number
      rotationName: string
      initialCapital: number
      totalExpense: number
      totalRevenue: number
      profit: number
      roi: number | null
    } | null = null

    if (activeRotation) {
      const rotStart = activeRotation.startDate.toFormat('yyyy-MM-dd')
      const [rotExpense, rotIncome, rotSales] = await Promise.all([
        Transaction.query()
          .where('businessId', businessId)
          .where('type', 'expense')
          .where('date', '>=', rotStart)
          .sum('amount as total')
          .first(),
        Transaction.query()
          .where('businessId', businessId)
          .where('type', 'income')
          .where('date', '>=', rotStart)
          .where((q) => q.whereNull('description').orWhere('description', 'not like', 'sale:%'))
          .sum('amount as total')
          .first(),
        Sale.query()
          .where('businessId', businessId)
          .where('date', '>=', rotStart)
          .sum('total_amount as total')
          .first(),
      ])

      const totalExpenseRot = Number(rotExpense?.$extras.total || 0)
      const totalIncomeRot = Number(rotIncome?.$extras.total || 0)
      const totalSalesRot = Number(rotSales?.$extras.total || 0)
      const totalRevenueRot = totalSalesRot + totalIncomeRot
      const profitRot = totalRevenueRot - totalExpenseRot
      const capital = Number(activeRotation.initialCapital)

      activeRotationKpis = {
        rotationId: activeRotation.id,
        rotationName: activeRotation.name,
        initialCapital: capital,
        totalExpense: totalExpenseRot,
        totalRevenue: totalRevenueRot,
        profit: profitRot,
        roi: capital > 0 ? Math.round((profitRot / capital) * 100) : null,
      }
    }

    const monthIncomeVal = Number(monthIncome?.$extras.total || 0)
    const monthExpenseVal = Number(monthExpense?.$extras.total || 0)

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
        monthIncome: monthIncomeVal,
        monthExpense: monthExpenseVal,
        monthProfit: monthIncomeVal - monthExpenseVal,
      },
      activeRotationKpis,
      monthlyBreakdown,
      recentTransactions,
      recentSales,
    }
  }
}
