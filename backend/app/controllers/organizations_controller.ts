import Organization from '#models/organization'
import { createOrganizationValidator, updateOrganizationValidator } from '#validators/organization'
import { isSuperAdmin } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!(await isSuperAdmin(user.id))) {
      return response.forbidden({ error: 'Superadmin access required' })
    }
    return Organization.query().orderBy('name', 'asc')
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!(await isSuperAdmin(user.id))) {
      return response.forbidden({ error: 'Superadmin access required' })
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
    return organization
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!(await isSuperAdmin(user.id))) {
      return response.forbidden({ error: 'Superadmin access required' })
    }
    return Organization.findOrFail(params.id)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!(await isSuperAdmin(user.id))) {
      return response.forbidden({ error: 'Superadmin access required' })
    }
    const organization = await Organization.findOrFail(params.id)
    const data = await request.validateUsing(updateOrganizationValidator)
    organization.merge(data)
    await organization.save()
    return organization
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!(await isSuperAdmin(user.id))) {
      return response.forbidden({ error: 'Superadmin access required' })
    }
    const organization = await Organization.findOrFail(params.id)
    await organization.delete()
    return { message: 'Organization deleted successfully' }
  }
}
