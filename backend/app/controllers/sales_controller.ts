import Sale from '#models/sale'
import SaleItem from '#models/sale_item'
import SalePayment from '#models/sale_payment'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import { createSaleValidator, createSalePaymentValidator } from '#validators/sale'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SalesController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const customerId = ctx.request.input('customer_id')
    const type = ctx.request.input('type')
    const status = ctx.request.input('status')
    await verifyBusinessAccess(ctx, businessId)
    const query = Sale.query()
      .where('businessId', businessId)
      .preload('customer')
      .preload('user')
      .preload('items')
      .preload('payments')
    if (customerId) query.where('customerId', customerId)
    if (type) query.where('type', type)
    if (status) query.where('status', status)
    return await query.orderBy('date', 'desc')
  }

  async store(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const data = await ctx.request.validateUsing(createSaleValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager', 'cashier'])

    const lastSale = await Sale.query()
      .where('businessId', data.businessId)
      .orderBy('id', 'desc')
      .first()

    const nextNum = lastSale ? Number.parseInt(lastSale.reference.split('-')[1] || '0') + 1 : 1
    const reference = `VTE-${String(nextNum).padStart(4, '0')}`

    let totalAmount = 0
    for (const item of data.items) {
      totalAmount += item.quantity * item.unitPrice
    }

    const paidAmount = data.type === 'cash' ? totalAmount : 0

    const sale = await Sale.create({
      businessId: data.businessId,
      customerId: data.customerId ?? null,
      userId: user.id,
      reference,
      type: data.type,
      status: data.type === 'cash' ? 'completed' : 'pending',
      totalAmount,
      paidAmount,
      date: DateTime.fromISO(data.date),
      notes: data.notes ?? null,
    })

    for (const item of data.items) {
      await SaleItem.create({
        saleId: sale.id,
        stockItemId: item.stockItemId ?? null,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })

      if (item.stockItemId) {
        const stockItem = await StockItem.find(item.stockItemId)
        if (stockItem) {
          stockItem.quantity -= item.quantity
          await stockItem.save()
          await StockMovement.create({
            stockItemId: item.stockItemId,
            businessId: data.businessId,
            userId: user.id,
            type: 'out',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            reason: 'sale',
            reference: reference,
            date: DateTime.fromISO(data.date),
          })
        }
      }
    }

    if (data.type === 'cash') {
      await SalePayment.create({
        saleId: sale.id,
        amount: totalAmount,
        paymentMethod: 'cash',
        date: DateTime.fromISO(data.date),
      })
    }

    await sale.load('items')
    await sale.load('customer')
    await sale.load('user')
    await sale.load('payments')
    return sale
  }

  async show(ctx: HttpContext) {
    const sale = await Sale.query()
      .where('id', ctx.params.id)
      .preload('customer')
      .preload('user')
      .preload('items')
      .preload('payments')
      .firstOrFail()
    await verifyBusinessAccess(ctx, sale.businessId)
    return sale
  }

  async addPayment(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(createSalePaymentValidator)
    const sale = await Sale.findOrFail(data.saleId)
    await verifyBusinessAccess(ctx, sale.businessId, ['admin', 'manager', 'cashier'])

    const payment = await SalePayment.create({
      ...data,
      date: DateTime.fromISO(data.date),
    })

    sale.paidAmount += data.amount
    if (sale.paidAmount >= sale.totalAmount) {
      sale.status = 'completed'
    }
    await sale.save()

    return payment
  }

  async destroy(ctx: HttpContext) {
    const sale = await Sale.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, sale.businessId, ['admin', 'manager'])
    await sale.delete()
    return { message: 'Sale deleted successfully' }
  }
}
