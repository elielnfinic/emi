import vine from '@vinejs/vine'

export const createOrganizationValidator = vine.create({
  name: vine.string().minLength(2).maxLength(255),
  slug: vine.string().minLength(2).maxLength(255).regex(/^[a-z0-9-]+$/),
  logoUrl: vine.string().url().nullable().optional(),
})

export const updateOrganizationValidator = vine.create({
  name: vine.string().minLength(2).maxLength(255).optional(),
  slug: vine.string().minLength(2).maxLength(255).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: vine.string().url().nullable().optional(),
})
