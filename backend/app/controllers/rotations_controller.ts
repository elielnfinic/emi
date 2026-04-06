import Rotation from '#models/rotation'
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
      .preload('transactions')
      .preload('sales')
      .firstOrFail()
    await verifyBusinessAccess(ctx, rotation.businessId)
    return rotation
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
