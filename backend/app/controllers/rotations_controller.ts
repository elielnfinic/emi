import Rotation from '#models/rotation'
import Transaction from '#models/transaction'
import Sale from '#models/sale'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const createRotationValidator = vine.compile(
  vine.object({
    businessId: vine.number(),
    name: vine.string().minLength(1).maxLength(255),
    startDate: vine.string(),
    initialCapital: vine.number().min(0),
    notes: vine.string().optional(),
  })
)

const closeRotationValidator = vine.compile(
  vine.object({
    notes: vine.string().optional(),
  })
)

export default class RotationsController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    await verifyBusinessAccess(ctx, businessId)
    const query = Rotation.query()
      .where('businessId', businessId)
      .preload('business')
    return await query.orderBy('createdAt', 'desc')
  }

  async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(createRotationValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager'])

    const activeRotation = await Rotation.query()
      .where('businessId', data.businessId)
      .where('status', 'active')
      .first()

    if (activeRotation) {
      return ctx.response.conflict({
        error: `Une rotation est déjà en cours ("${activeRotation.name}"). Clôturez-la avant d'en créer une nouvelle.`,
      })
    }

    const rotation = await Rotation.create({
      businessId: data.businessId,
      name: data.name,
      status: 'active',
      startDate: DateTime.fromISO(data.startDate),
      initialCapital: data.initialCapital,
      notes: data.notes ?? null,
    })
    return rotation
  }

  async show(ctx: HttpContext) {
    const rotation = await Rotation.query()
      .where('id', ctx.params.id)
      .preload('business')
      .firstOrFail()
    await verifyBusinessAccess(ctx, rotation.businessId)

    // Use the rotation's date range to collect all operations automatically.
    // No need to manually stamp each transaction/sale with a rotationId.
    const startStr = rotation.startDate.toFormat('yyyy-MM-dd')
    const endStr = (rotation.endDate ?? DateTime.now()).toFormat('yyyy-MM-dd')

    // Fetch all transactions in the period, excluding auto-generated income
    // entries that mirror sale totals (description starts with 'sale:') to
    // avoid double-counting when computing revenue.
    const transactions = await Transaction.query()
      .where('businessId', rotation.businessId)
      .where('date', '>=', startStr)
      .where('date', '<=', endStr)
      .where((q) => {
        q.whereNull('description').orWhere('description', 'not like', 'sale:%')
      })
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')

    // Fetch all sales in the period
    const sales = await Sale.query()
      .where('businessId', rotation.businessId)
      .where('date', '>=', startStr)
      .where('date', '<=', endStr)
      .preload('customer')
      .preload('items')
      .preload('payments')
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')

    return {
      ...rotation.serialize(),
      transactions,
      sales,
    }
  }

  async close(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const data = await ctx.request.validateUsing(closeRotationValidator)
    const rotation = await Rotation.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, rotation.businessId, ['admin', 'manager'])
    const now = DateTime.now()
    rotation.status = 'closed'
    rotation.endDate = now
    rotation.closedAt = now
    rotation.closedBy = user.id
    if (data.notes) rotation.notes = data.notes
    await rotation.save()
    return rotation
  }

  async destroy(ctx: HttpContext) {
    const rotation = await Rotation.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, rotation.businessId, ['admin'])
    await rotation.delete()
    return { message: 'Rotation deleted successfully' }
  }
}
