import BusinessUser from '#models/business_user'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const addUserValidator = vine.compile(
  vine.object({
    businessId: vine.number(),
    userId: vine.number(),
    roleId: vine.number(),
  })
)

export default class BusinessUsersController {
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const query = BusinessUser.query().preload('user').preload('role')
    if (businessId) query.where('businessId', businessId)
    return await query.orderBy('createdAt', 'desc')
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(addUserValidator)
    const businessUser = await BusinessUser.create({
      businessId: data.businessId,
      userId: data.userId,
      roleId: data.roleId,
      isActive: true,
    })
    await businessUser.load('user')
    await businessUser.load('role')
    return businessUser
  }

  async users({}: HttpContext) {
    return await User.query().orderBy('fullName', 'asc')
  }

  async destroy({ params }: HttpContext) {
    const bu = await BusinessUser.findOrFail(params.id)
    await bu.delete()
    return { message: 'User removed from business' }
  }
}
