import BusinessUser from '#models/business_user'
import Business from '#models/business'
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
 * Role hierarchy: admin > manager > cashier = stock
 * - admin: Full access to everything in the business
 * - manager: Can manage sales, transactions, customers, suppliers, stock, reports
 * - cashier: Can view/create sales, view customers
 * - stock: Can view/manage stock items
 */
const ROLE_NAMES: Record<number, string> = {
  1: 'admin',
  2: 'manager',
  3: 'cashier',
  4: 'stock',
}

/**
 * Get the user's role name in a specific business.
 * Returns null if user is not assigned to the business.
 */
export async function getUserRoleInBusiness(
  userId: number,
  businessId: number
): Promise<string | null> {
  const bu = await BusinessUser.query()
    .where('userId', userId)
    .where('businessId', businessId)
    .where('isActive', true)
    .first()
  if (!bu) return null
  return ROLE_NAMES[bu.roleId] || null
}

/**
 * Check if the user is an org-level admin (admin in at least one business of the org).
 */
export async function isOrgAdmin(userId: number, organizationId: number): Promise<boolean> {
  const adminBu = await BusinessUser.query()
    .where('userId', userId)
    .where('isActive', true)
    .whereHas('business', (q) => {
      q.where('organizationId', organizationId)
    })
    .where('roleId', 1) // admin role
    .first()
  return !!adminBu
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
 * Verify the authenticated user belongs to the given organization.
 */
export async function verifyOrgAccess(
  ctx: HttpContext,
  organizationId: number
): Promise<void> {
  const user = ctx.auth.getUserOrFail()

  // Superadmin has access to all organizations
  if (await isSuperAdmin(user.id)) return

  // If the user has organizationId set, check it matches
  if (user.organizationId && user.organizationId === organizationId) {
    return
  }

  // Also check if user has any business assignment in this org
  const bu = await BusinessUser.query()
    .where('userId', user.id)
    .where('isActive', true)
    .whereHas('business', (q) => {
      q.where('organizationId', organizationId)
    })
    .first()

  if (!bu) {
    return ctx.response.forbidden({
      error: 'You do not have access to this organization',
    }) as never
  }
}

/**
 * Get the organization ID for the authenticated user.
 * Checks user.organizationId first, then falls back to their business assignments.
 */
export async function getUserOrganizationId(userId: number): Promise<number | null> {
  // First check direct assignment
  const { default: User } = await import('#models/user')
  const user = await User.find(userId)
  if (user?.organizationId) return user.organizationId

  // Fall back to business assignment
  const bu = await BusinessUser.query()
    .where('userId', userId)
    .where('isActive', true)
    .preload('business')
    .first()

  return bu?.business?.organizationId ?? null
}

/**
 * Get all business IDs the user has access to (ones they are assigned to).
 */
export async function getUserBusinessIds(userId: number): Promise<number[]> {
  const businessUsers = await BusinessUser.query()
    .where('userId', userId)
    .where('isActive', true)
  return businessUsers.map((bu) => bu.businessId)
}

/**
 * Verify a resource's businessId matches one the user has access to.
 * Used for show/update/destroy of resources that have a businessId field.
 */
export async function verifyResourceAccess(
  ctx: HttpContext,
  resourceBusinessId: number,
  requiredRoles?: string[]
): Promise<string> {
  return verifyBusinessAccess(ctx, resourceBusinessId, requiredRoles)
}
