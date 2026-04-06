import User from '#models/user'
import BusinessUser from '#models/business_user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokenController {
  async store({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch (err: unknown) {
      // verifyCredentials throws E_INVALID_CREDENTIALS for wrong credentials.
      // It may also throw a parse error if the stored password hash is malformed
      // (e.g. was accidentally stored as plaintext). In both cases, return 422
      // instead of letting the error bubble up as 500.
      const code = (err as { code?: string })?.code
      if (code === 'E_INVALID_CREDENTIALS') {
        return response.unprocessableEntity({ message: 'Email ou mot de passe incorrect' })
      }
      // Hash parse error from a corrupted stored value — treat as invalid credentials
      return response.unprocessableEntity({ message: 'Email ou mot de passe incorrect' })
    }
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
        ...new UserTransformer(user).toObject(),
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
