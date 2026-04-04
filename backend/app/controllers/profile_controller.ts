import UserTransformer from '#transformers/user_transformer'
import BusinessUser from '#models/business_user'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
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
      ...UserTransformer.transform(user).toObject(),
      role: user.role?.name ?? null,
      businessRoles: roles,
    })
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const validator = vine.create({
      fullName: vine.string().minLength(2).maxLength(100),
    })
    const data = await request.validateUsing(validator)
    user.fullName = data.fullName
    await user.save()
    return response.ok({ message: 'Profil mis à jour', fullName: user.fullName })
  }

  async updatePassword({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const validator = vine.create({
      currentPassword: vine.string(),
      newPassword: vine.string().minLength(8).maxLength(32),
    })
    const data = await request.validateUsing(validator)

    const isValid = await hash.verify(user.password, data.currentPassword)
    if (!isValid) {
      return response.unprocessableEntity({ message: 'Mot de passe actuel incorrect' })
    }

    user.password = data.newPassword
    await user.save()
    return response.ok({ message: 'Mot de passe mis à jour avec succès' })
  }

  async requestEmailChange({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const validator = vine.create({
      newEmail: vine.string().email().maxLength(254),
    })
    const data = await request.validateUsing(validator)

    if (data.newEmail === user.email) {
      return response.unprocessableEntity({ message: 'Cette adresse email est déjà la vôtre' })
    }

    const existingUser = await User.findBy('email', data.newEmail)
    if (existingUser) {
      return response.unprocessableEntity({ message: 'Cette adresse email est déjà utilisée' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.pendingEmail = data.newEmail
    user.emailOtp = otp
    user.emailOtpExpiresAt = DateTime.now().plus({ minutes: 15 })
    await user.save()

    const { default: mail } = await import('@adonisjs/mail/services/main')
    await mail.send((message) => {
      message
        .to(data.newEmail)
        .subject('Vérifiez votre nouvelle adresse email — EMI')
        .html(
          `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#7c3aed">Vérification d'email</h2>
            <p>Bonjour ${user.fullName || user.email},</p>
            <p>Votre code de vérification pour changer votre adresse email est :</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#7c3aed;text-align:center;padding:20px;background:#f5f3ff;border-radius:8px;margin:20px 0">
              ${otp}
            </div>
            <p>Ce code expire dans <strong>15 minutes</strong>.</p>
            <p style="color:#6b7280;font-size:13px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </div>`
        )
    })

    return response.ok({ message: 'Code de vérification envoyé à ' + data.newEmail })
  }

  async verifyEmailChange({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const validator = vine.create({
      otp: vine.string().fixedLength(6),
    })
    const data = await request.validateUsing(validator)

    if (!user.pendingEmail || !user.emailOtp || !user.emailOtpExpiresAt) {
      return response.unprocessableEntity({ message: 'Aucune demande de changement d\'email en cours' })
    }

    if (user.emailOtpExpiresAt < DateTime.now()) {
      return response.unprocessableEntity({ message: 'Le code a expiré, veuillez en demander un nouveau' })
    }

    if (user.emailOtp !== data.otp) {
      return response.unprocessableEntity({ message: 'Code incorrect' })
    }

    user.email = user.pendingEmail
    user.pendingEmail = null
    user.emailOtp = null
    user.emailOtpExpiresAt = null
    await user.save()

    return response.ok({ message: 'Adresse email mise à jour', email: user.email })
  }

  async adminUpdateUser({ auth, params, request, response }: HttpContext) {
    const currentUser = auth.getUserOrFail()
    await currentUser.load('role')
    if (currentUser.role?.name !== 'superadmin') {
      return response.forbidden({ message: 'Accès non autorisé' })
    }

    const target = await User.findOrFail(params.id)
    const validator = vine.create({
      fullName: vine.string().minLength(2).maxLength(100).optional(),
      email: vine.string().email().maxLength(254).optional(),
      password: vine.string().minLength(8).maxLength(32).optional(),
    })
    const data = await request.validateUsing(validator)

    if (data.email && data.email !== target.email) {
      const existing = await User.query()
        .where('email', data.email)
        .whereNot('id', target.id)
        .first()
      if (existing) {
        return response.unprocessableEntity({ message: 'Cette adresse email est déjà utilisée' })
      }
      target.email = data.email
    }

    if (data.fullName !== undefined) target.fullName = data.fullName
    if (data.password) target.password = data.password

    await target.save()
    return response.ok({
      message: 'Utilisateur mis à jour',
      user: { id: target.id, fullName: target.fullName, email: target.email },
    })
  }
}
