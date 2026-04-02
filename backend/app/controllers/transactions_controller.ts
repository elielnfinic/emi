import Transaction from '#models/transaction'
import { createTransactionValidator, updateTransactionValidator } from '#validators/transaction'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class TransactionsController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const type = ctx.request.input('type')
    const beneficiary = ctx.request.input('beneficiary')
    const search = ctx.request.input('search', '')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)
    const query = Transaction.query()
      .where('businessId', businessId)
      .preload('category')
      .preload('user')
    if (type) {
      query.where('type', type)
    }
    if (beneficiary) {
      query.where('beneficiary', beneficiary)
    }
    if (search) {
      query.where((q) => {
        q.whereILike('reference', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereILike('beneficiary', `%${search}%`)
      })
    }
    return await query.orderBy('date', 'desc').paginate(page, perPage)
  }

  async store(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const data = await ctx.request.validateUsing(createTransactionValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager'])

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

  async show(ctx: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', ctx.params.id)
      .preload('category')
      .preload('user')
      .preload('attachments')
      .firstOrFail()
    await verifyBusinessAccess(ctx, transaction.businessId)
    return transaction
  }

  async update(ctx: HttpContext) {
    const transaction = await Transaction.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, transaction.businessId, ['admin', 'manager'])
    const data = await ctx.request.validateUsing(updateTransactionValidator)
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

  async destroy(ctx: HttpContext) {
    const transaction = await Transaction.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, transaction.businessId, ['admin', 'manager'])
    await transaction.delete()
    return { message: 'Transaction deleted successfully' }
  }
}
