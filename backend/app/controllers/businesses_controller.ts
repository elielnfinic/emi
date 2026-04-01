import Business from '#models/business'
import { createBusinessValidator, updateBusinessValidator } from '#validators/business'
import type { HttpContext } from '@adonisjs/core/http'

export default class BusinessesController {
  async index({ request }: HttpContext) {
    const organizationId = request.input('organization_id')
    const query = Business.query().preload('organization')
    if (organizationId) {
      query.where('organizationId', organizationId)
    }
    const businesses = await query.orderBy('name', 'asc')
    return businesses
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createBusinessValidator)
    const business = await Business.create(data)
    await business.load('organization')
    return business
  }

  async show({ params }: HttpContext) {
    const business = await Business.query()
      .where('id', params.id)
      .preload('organization')
      .firstOrFail()
    return business
  }

  async update({ params, request }: HttpContext) {
    const business = await Business.findOrFail(params.id)
    const data = await request.validateUsing(updateBusinessValidator)
    business.merge(data)
    await business.save()
    await business.load('organization')
    return business
  }

  async destroy({ params }: HttpContext) {
    const business = await Business.findOrFail(params.id)
    await business.delete()
    return { message: 'Business deleted successfully' }
  }
}
