import User from '#models/user'
import BusinessUser from '#models/business_user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokenController {
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    await user.load('role')

    // Include business roles in response
    const businessUsers = await BusinessUser.query()
      .where('userId', user.id)
      .where('isActive', true)
      .preload('role')

    const businessRoles: Record<number, string> = {}
    for (const bu of businessUsers) {
      businessRoles[bu.businessId] = bu.role?.name || 'unknown'
    }

    return serialize({
      user: {
        ...UserTransformer.transform(user),
        role: user.role?.name ?? null,
        businessRoles,
      },
      token: token.value!.release(),
    })
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return {
      message: 'Logged out successfully',
    }
  }
}
