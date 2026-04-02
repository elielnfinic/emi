import Business from '#models/business'
import { createBusinessValidator, updateBusinessValidator } from '#validators/business'
import { getUserOrganizationId, verifyBusinessAccess, isOrgAdmin } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class BusinessesController {
  async index({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const organizationId = request.input('organization_id')
    const orgId = organizationId || (await getUserOrganizationId(user.id))
    if (!orgId) return []

    // Only return businesses in the user's organization
    const businesses = await Business.query()
      .where('organizationId', orgId)
      .preload('organization')
      .orderBy('name', 'asc')
    return businesses
  }

  async store(ctx: HttpContext) {
    const { request, auth, response } = ctx
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createBusinessValidator)

    // Verify the business is being created in user's org
    const orgId = await getUserOrganizationId(user.id)
    if (orgId && data.organizationId !== orgId) {
      return response.forbidden({ error: 'You can only create businesses in your organization' })
    }

    // If user has an org, check they are an admin
    if (orgId) {
      const admin = await isOrgAdmin(user.id, orgId)
      if (!admin) {
        // Allow if this is the first business (bootstrapping)
        const existingBusinesses = await Business.query().where('organizationId', orgId)
        if (existingBusinesses.length > 0) {
          return response.forbidden({ error: 'Only admins can create new businesses' })
        }
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
    const business = await Business.create(data)
    await business.load('organization')

    // Auto-assign creator as admin if not already in the business
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
    const business = await Business.query()
      .where('id', params.id)
      .preload('organization')
      .firstOrFail()
    await verifyBusinessAccess(ctx, business.id)
    return business
  }

  async update(ctx: HttpContext) {
    const { params, request } = ctx
    const business = await Business.findOrFail(params.id)
    await verifyBusinessAccess(ctx, business.id, ['admin'])
    const data = await request.validateUsing(updateBusinessValidator)
    business.merge(data)
    await business.save()
    await business.load('organization')
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
