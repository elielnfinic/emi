import Business from '#models/business'
import { createBusinessValidator, updateBusinessValidator } from '#validators/business'
import { verifyBusinessAccess, isSuperAdmin, getUserBusinessIds, isBusinessAdmin } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class BusinessesController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()

    if (await isSuperAdmin(user.id)) {
      return Business.query().orderBy('name', 'asc')
    }

    // Return only businesses the user is assigned to
    const businessIds = await getUserBusinessIds(user.id)
    if (!businessIds.length) return []
    return Business.query().whereIn('id', businessIds).orderBy('name', 'asc')
  }

  async store(ctx: HttpContext) {
    const { request, auth, response } = ctx
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createBusinessValidator)

    const superAdmin = await isSuperAdmin(user.id)

    if (!superAdmin) {
      const admin = await isBusinessAdmin(user.id)
      if (!admin) {
        return response.forbidden({ error: 'Only admins can create new businesses' })
      }
    }

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }

    const business = await Business.create({
      name: data.name,
      slug: data.slug,
      type: data.type,
      supportsRotations: data.type === 'rotation' ? true : (data.supportsRotations ?? false),
      currency: data.currency,
      address: data.address,
      phone: data.phone,
    })

    // Auto-assign creator as admin
    const { default: BusinessUser } = await import('#models/business_user')
    const existing = await BusinessUser.query()
      .where('businessId', business.id)
      .where('userId', user.id)
      .first()
    if (!existing) {
      await BusinessUser.create({
        businessId: business.id,
        userId: user.id,
        roleId: 1, // admin
        isActive: true,
      })
    }

    return business
  }

  async show(ctx: HttpContext) {
    const { params } = ctx
    const business = await Business.findOrFail(params.id)
    await verifyBusinessAccess(ctx, business.id)
    return business
  }

  async update(ctx: HttpContext) {
    const { params, request } = ctx
    const business = await Business.findOrFail(params.id)
    await verifyBusinessAccess(ctx, business.id, ['admin'])
    const data = await request.validateUsing(updateBusinessValidator)
    business.merge(data)
    // Keep supportsRotations in sync with type
    if (data.type !== undefined) {
      business.supportsRotations = data.type === 'rotation'
    }
    await business.save()
    return business
  }

  async destroy(ctx: HttpContext) {
    const { params } = ctx
    const business = await Business.findOrFail(params.id)
    await verifyBusinessAccess(ctx, business.id, ['admin'])
    await business.delete()
    return { message: 'Business deleted successfully' }
  }
}
