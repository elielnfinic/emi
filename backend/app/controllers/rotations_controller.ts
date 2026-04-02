import Rotation from '#models/rotation'
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
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const query = Rotation.query().preload('business')
    if (businessId) query.where('businessId', businessId)
    return await query.orderBy('createdAt', 'desc')
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createRotationValidator)
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

  async show({ params }: HttpContext) {
    return await Rotation.query()
      .where('id', params.id)
      .preload('business')
      .preload('transactions')
      .preload('sales')
      .firstOrFail()
  }

  async close({ params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(closeRotationValidator)
    const rotation = await Rotation.findOrFail(params.id)
    const now = DateTime.now()
    rotation.status = 'closed'
    rotation.endDate = now
    rotation.closedAt = now
    rotation.closedBy = user.id
    if (data.notes) rotation.notes = data.notes
    await rotation.save()
    return rotation
  }

  async destroy({ params }: HttpContext) {
    const rotation = await Rotation.findOrFail(params.id)
    await rotation.delete()
    return { message: 'Rotation deleted successfully' }
  }
}
