import BusinessUser from '#models/business_user'
import User from '#models/user'
import { verifyBusinessAccess, isSuperAdmin, getUserBusinessIds, isBusinessAdmin } from '#services/authorization'
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
   * List users visible to the requesting user.
   * Superadmin sees all users.
   * Others see users in the same businesses they belong to.
   */
  async users(ctx: HttpContext) {
    const authUser = ctx.auth.getUserOrFail()

    if (await isSuperAdmin(authUser.id)) {
      return await User.query().orderBy('fullName', 'asc')
    }

    // Return users in the same businesses as the requesting user
    const businessIds = await getUserBusinessIds(authUser.id)
    if (!businessIds.length) return []

    const businessUsers = await BusinessUser.query()
      .whereIn('businessId', businessIds)
      .where('isActive', true)

    const userIds = [...new Set(businessUsers.map((bu) => bu.userId))]
    if (!userIds.length) return []

    return await User.query()
      .whereIn('id', userIds)
      .orderBy('fullName', 'asc')
  }

  async update(ctx: HttpContext) {
    const bu = await BusinessUser.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, bu.businessId, ['admin'])
    const { roleId } = await ctx.request.validateUsing(
      vine.compile(vine.object({ roleId: vine.number() }))
    )
    bu.roleId = roleId
    await bu.save()
    await bu.load('user')
    await bu.load('role')
    return bu
  }

  async destroy(ctx: HttpContext) {
    const bu = await BusinessUser.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, bu.businessId, ['admin'])
    await bu.delete()
    return { message: 'User removed from business' }
  }

  /**
   * Create a new user account.
   * Superadmin can always create users.
   * Business admins can create users.
   */
  async createUser(ctx: HttpContext) {
    const authUser = ctx.auth.getUserOrFail()
    const superAdmin = await isSuperAdmin(authUser.id)

    if (!superAdmin) {
      const admin = await isBusinessAdmin(authUser.id)
      if (!admin) {
        return ctx.response.forbidden({ error: 'Only admins can create new users' })
      }
    }

    const data = await ctx.request.validateUsing(createUserValidator)
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    })

    // Send welcome email if requested
    if (data.sendEmail) {
      try {
        const { default: mail } = await import('@adonisjs/mail/services/main')
        await mail.send((message) => {
          message
            .from(process.env.SMTP_FROM_ADDRESS || 'noreply@emi.local')
            .to(data.email)
            .subject('Votre compte EMI a été créé')
            .html(`<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:#0a0a0f;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">EMI</p>
          <p style="margin:4px 0 0;font-size:11px;color:#71717a;letter-spacing:2px;text-transform:uppercase">Opérations Réussies</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 32px">
          <h2 style="margin:0 0 8px;font-size:20px;color:#09090b">Bonjour ${data.fullName} 👋</h2>
          <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6">
            Un compte a été créé pour vous sur <strong>EMI</strong>. Voici vos identifiants de connexion :
          </p>

          <!-- Credentials box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #e0d9ff;border-radius:10px;margin-bottom:28px">
            <tr><td style="padding:20px 24px">
              <p style="margin:0 0 10px;font-size:13px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1px">Vos identifiants</p>
              <p style="margin:0 0 8px;font-size:14px;color:#09090b">
                <span style="color:#71717a;display:inline-block;width:90px">Email</span>
                <strong>${data.email}</strong>
              </p>
              <p style="margin:0;font-size:14px;color:#09090b">
                <span style="color:#71717a;display:inline-block;width:90px">Mot de passe</span>
                <strong style="font-family:monospace;font-size:15px;background:#ede9fe;padding:2px 8px;border-radius:4px">${data.password}</strong>
              </p>
            </td></tr>
          </table>

          <p style="margin:0 0 28px;color:#52525b;font-size:14px;line-height:1.6">
            Pour votre sécurité, connectez-vous et <strong>changez votre mot de passe</strong> dès que possible.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto">
            <tr><td align="center" style="border-radius:10px;background:#7c3aed">
              <a href="https://emi.souple.app/" target="_blank"
                 style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px">
                Accéder à l'application →
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f4f4f8;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center">
          <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa">
            Vous pouvez aussi copier ce lien dans votre navigateur :
          </p>
          <a href="https://emi.souple.app/" style="font-size:12px;color:#7c3aed;text-decoration:none">https://emi.souple.app/</a>
          <p style="margin:16px 0 0;font-size:11px;color:#d4d4d8">© EMI — Opérations Réussies</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`)
        })
      } catch {
        // Email sending is best-effort; don't fail user creation
      }
    }

    return user
  }
}
