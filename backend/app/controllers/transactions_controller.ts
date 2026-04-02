import Transaction from '#models/transaction'
import { createTransactionValidator, updateTransactionValidator } from '#validators/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class TransactionsController {
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const type = request.input('type')
    const query = Transaction.query().preload('category').preload('user')
    if (businessId) {
      query.where('businessId', businessId)
    }
    if (type) {
      query.where('type', type)
    }
    const transactions = await query.orderBy('date', 'desc')
    return transactions
  }

  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createTransactionValidator)

    const lastTx = await Transaction.query()
      .where('businessId', data.businessId)
      .where('type', data.type)
      .orderBy('id', 'desc')
      .first()

    const prefix = data.type === 'income' ? 'ENT' : 'SOR'
    const nextNum = lastTx ? parseInt(lastTx.reference.split('-')[1] || '0') + 1 : 1
    const reference = `${prefix}-${String(nextNum).padStart(4, '0')}`

    const transaction = await Transaction.create({
      ...data,
      userId: user.id,
      reference,
      date: DateTime.fromISO(data.date),
    })
    await transaction.load('category')
    await transaction.load('user')
    return transaction
  }

  async show({ params }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('category')
      .preload('user')
      .preload('attachments')
      .firstOrFail()
    return transaction
  }

  async update({ params, request }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const data = await request.validateUsing(updateTransactionValidator)
    const mergeData: Record<string, unknown> = { ...data }
    if (data.date) {
      mergeData.date = DateTime.fromISO(data.date)
    }
    transaction.merge(mergeData as Partial<Transaction>)
    await transaction.save()
    await transaction.load('category')
    await transaction.load('user')
    return transaction
  }

  async destroy({ params }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    await transaction.delete()
    return { message: 'Transaction deleted successfully' }
  }
}
