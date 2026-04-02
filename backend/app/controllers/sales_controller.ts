import Sale from '#models/sale'
import SaleItem from '#models/sale_item'
import SalePayment from '#models/sale_payment'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import { createSaleValidator, createSalePaymentValidator } from '#validators/sale'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SalesController {
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const customerId = request.input('customer_id')
    const type = request.input('type')
    const status = request.input('status')
    const query = Sale.query().preload('customer').preload('user').preload('items').preload('payments')
    if (businessId) query.where('businessId', businessId)
    if (customerId) query.where('customerId', customerId)
    if (type) query.where('type', type)
    if (status) query.where('status', status)
    return await query.orderBy('date', 'desc')
  }

  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createSaleValidator)

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

  async show({ params }: HttpContext) {
    return await Sale.query()
      .where('id', params.id)
      .preload('customer')
      .preload('user')
      .preload('items')
      .preload('payments')
      .firstOrFail()
  }

  async addPayment({ request }: HttpContext) {
    const data = await request.validateUsing(createSalePaymentValidator)
    const sale = await Sale.findOrFail(data.saleId)

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

  async destroy({ params }: HttpContext) {
    const sale = await Sale.findOrFail(params.id)
    await sale.delete()
    return { message: 'Sale deleted successfully' }
  }
}
