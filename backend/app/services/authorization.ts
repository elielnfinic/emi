import BusinessUser from '#models/business_user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Check if a user has the superadmin system role.
 */
export async function isSuperAdmin(userId: number): Promise<boolean> {
  const { default: User } = await import('#models/user')
  const user = await User.query().where('id', userId).preload('role').first()
  return user?.role?.name === 'superadmin'
}

/**
 * Get the user's role name in a specific business.
 */
export async function getUserRoleInBusiness(
  userId: number,
  businessId: number
): Promise<string | null> {
  const bu = await BusinessUser.query()
    .where('userId', userId)
    .where('businessId', businessId)
    .where('isActive', true)
    .preload('role')
    .first()
  if (!bu) return null
  return bu.role?.name ?? null
}

/**
 * Verify the authenticated user has access to the specified business.
 * Returns the user's role name, or throws 403.
 */
export async function verifyBusinessAccess(
  ctx: HttpContext,
  businessId: number | string | undefined | null,
  requiredRoles?: string[]
): Promise<string> {
  const user = ctx.auth.getUserOrFail()
  if (!businessId) {
    return ctx.response.forbidden({ error: 'business_id is required' }) as never
  }

  const bid = typeof businessId === 'string' ? Number.parseInt(businessId) : businessId
  if (Number.isNaN(bid)) {
    return ctx.response.forbidden({ error: 'Invalid business_id' }) as never
  }

  // Superadmin bypasses all business access checks
  if (await isSuperAdmin(user.id)) return 'admin'

  // Check the user belongs to this business
  const role = await getUserRoleInBusiness(user.id, bid)
  if (!role) {
    return ctx.response.forbidden({
      error: 'You do not have access to this business',
    }) as never
  }

  // Check role permission if specific roles are required
  if (requiredRoles && !requiredRoles.includes(role)) {
    return ctx.response.forbidden({
      error: `This action requires one of: ${requiredRoles.join(', ')}`,
    }) as never
  }

  return role
}

/**
 * Get all business IDs the user has access to.
 */
export async function getUserBusinessIds(userId: number): Promise<number[]> {
  const businessUsers = await BusinessUser.query()
    .where('userId', userId)
    .where('isActive', true)
  return businessUsers.map((bu) => bu.businessId)
}

/**
 * Check if user is admin in any of their businesses.
 */
export async function isBusinessAdmin(userId: number): Promise<boolean> {
  const bu = await BusinessUser.query()
    .where('userId', userId)
    .where('isActive', true)
    .preload('role')
    .first()
  return bu?.role?.name === 'admin'
}

/**
 * Verify a resource's businessId matches one the user has access to.
 */
export async function verifyResourceAccess(
  ctx: HttpContext,
  resourceBusinessId: number,
  requiredRoles?: string[]
): Promise<string> {
  return verifyBusinessAccess(ctx, resourceBusinessId, requiredRoles)
}
