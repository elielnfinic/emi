import UserTransformer from '#transformers/user_transformer'
import BusinessUser from '#models/business_user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('role')

    const businessUsersData = await BusinessUser.query()
      .where('userId', user.id)
      .where('isActive', true)
      .preload('role')

    const roles: Record<number, string> = {}
    for (const bu of businessUsersData) {
      roles[bu.businessId] = bu.role?.name || 'unknown'
    }

    return serialize({
      ...UserTransformer.transform(user),
      role: user.role?.name ?? null,
      businessRoles: roles,
    })
  }
}
