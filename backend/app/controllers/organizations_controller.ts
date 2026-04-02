import Organization from '#models/organization'
import { createOrganizationValidator, updateOrganizationValidator } from '#validators/organization'
import { getUserOrganizationId, verifyOrgAccess, isOrgAdmin, isSuperAdmin } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (await isSuperAdmin(user.id)) {
      return Organization.query().orderBy('name', 'asc')
    }
    const orgId = await getUserOrganizationId(user.id)
    if (!orgId) return []
    const organizations = await Organization.query().where('id', orgId).orderBy('name', 'asc')
    return organizations
  }

  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    // Only allow creating an org if user doesn't have one yet
    const existingOrgId = await getUserOrganizationId(user.id)
    if (existingOrgId) {
      const data = await request.validateUsing(createOrganizationValidator)
      if (!data.slug) {
        data.slug = data.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }
      // Create within existing org context — but generally orgs are auto-created
      const organization = await Organization.create(data)
      return organization
    }
    const data = await request.validateUsing(createOrganizationValidator)
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    const organization = await Organization.create(data)
    // Assign the org to the creating user
    const { default: User } = await import('#models/user')
    const dbUser = await User.findOrFail(user.id)
    dbUser.organizationId = organization.id
    await dbUser.save()
    return organization
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const organization = await Organization.findOrFail(params.id)
    const orgId = await getUserOrganizationId(user.id)
    if (orgId !== organization.id) {
      return response.forbidden({ error: 'You do not have access to this organization' })
    }
    return organization
  }

  async update(ctx: HttpContext) {
    const { params, request } = ctx
    const organization = await Organization.findOrFail(params.id)
    await verifyOrgAccess(ctx, organization.id)
    const user = ctx.auth.getUserOrFail()
    const admin = await isOrgAdmin(user.id, organization.id)
    if (!admin) {
      return ctx.response.forbidden({ error: 'Only admins can update the organization' })
    }
    const data = await request.validateUsing(updateOrganizationValidator)
    organization.merge(data)
    await organization.save()
    return organization
  }

  async destroy(ctx: HttpContext) {
    const { params } = ctx
    const organization = await Organization.findOrFail(params.id)
    await verifyOrgAccess(ctx, organization.id)
    const user = ctx.auth.getUserOrFail()
    const admin = await isOrgAdmin(user.id, organization.id)
    if (!admin) {
      return ctx.response.forbidden({ error: 'Only admins can delete the organization' })
    }
    await organization.delete()
    return { message: 'Organization deleted successfully' }
  }
}
