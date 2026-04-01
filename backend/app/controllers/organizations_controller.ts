import Organization from '#models/organization'
import { createOrganizationValidator, updateOrganizationValidator } from '#validators/organization'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  async index({}: HttpContext) {
    const organizations = await Organization.query().orderBy('name', 'asc')
    return organizations
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createOrganizationValidator)
    const organization = await Organization.create(data)
    return organization
  }

  async show({ params }: HttpContext) {
    const organization = await Organization.findOrFail(params.id)
    return organization
  }

  async update({ params, request }: HttpContext) {
    const organization = await Organization.findOrFail(params.id)
    const data = await request.validateUsing(updateOrganizationValidator)
    organization.merge(data)
    await organization.save()
    return organization
  }

  async destroy({ params }: HttpContext) {
    const organization = await Organization.findOrFail(params.id)
    await organization.delete()
    return { message: 'Organization deleted successfully' }
  }
}
