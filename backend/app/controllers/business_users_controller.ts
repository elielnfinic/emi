import BusinessUser from '#models/business_user'
import User from '#models/user'
import { verifyBusinessAccess, getUserOrganizationId, isOrgAdmin } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

const addUserValidator = vine.compile(
  vine.object({
    businessId: vine.number(),
    userId: vine.number(),
    roleId: vine.number(),
  })
)

const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(1),
    email: vine.string().email().maxLength(254),
    password: vine.string().minLength(8).maxLength(128),
    sendEmail: vine.boolean().optional(),
  })
)

export default class BusinessUsersController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    await verifyBusinessAccess(ctx, businessId)
    const query = BusinessUser.query()
      .where('businessId', businessId)
      .preload('user')
      .preload('role')
    return await query.orderBy('createdAt', 'desc')
  }

  async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(addUserValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin'])

    // Verify the target user belongs to the same organization
    const authUser = ctx.auth.getUserOrFail()
    const orgId = await getUserOrganizationId(authUser.id)
    const targetUser = await User.findOrFail(data.userId)
    if (orgId && targetUser.organizationId !== orgId) {
      return ctx.response.forbidden({ error: 'User does not belong to your organization' })
    }

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

  /**
   * List users scoped to the current user's organization only.
   */
  async users(ctx: HttpContext) {
    const authUser = ctx.auth.getUserOrFail()
    const orgId = await getUserOrganizationId(authUser.id)
    if (!orgId) return []
    return await User.query()
      .where('organizationId', orgId)
      .orderBy('fullName', 'asc')
  }

  async destroy(ctx: HttpContext) {
    const bu = await BusinessUser.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, bu.businessId, ['admin'])
    await bu.delete()
    return { message: 'User removed from business' }
  }

  /**
   * Create a new user account and assign to the current organization.
   * Only admins can create users.
   */
  async createUser(ctx: HttpContext) {
    const authUser = ctx.auth.getUserOrFail()
    const orgId = await getUserOrganizationId(authUser.id)

    if (!orgId) {
      return ctx.response.forbidden({ error: 'You must belong to an organization to create users' })
    }

    const admin = await isOrgAdmin(authUser.id, orgId)
    if (!admin) {
      return ctx.response.forbidden({ error: 'Only admins can create new users' })
    }

    const data = await ctx.request.validateUsing(createUserValidator)
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      organizationId: orgId,
    })

    // Send welcome email if requested
    if (data.sendEmail) {
      try {
        const { default: mail } = await import('@adonisjs/mail/services/main')
        await mail.send((message) => {
          message
            .from(process.env.SMTP_FROM_ADDRESS || 'noreply@emi.local')
            .to(data.email)
            .subject('Your EMI Account Has Been Created')
            .html(`
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7B5CF6;">Welcome to EMI!</h2>
                <p>Hello <strong>${data.fullName}</strong>,</p>
                <p>An account has been created for you on EMI — Opérations Réussies.</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 4px 0;"><strong>Email:</strong> ${data.email}</p>
                  <p style="margin: 4px 0;"><strong>Password:</strong> ${data.password}</p>
                </div>
                <p>Please log in and change your password as soon as possible.</p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                  — The EMI Team
                </p>
              </div>
            `)
        })
      } catch {
        // Email sending is best-effort; don't fail user creation
      }
    }

    return user
  }
}
