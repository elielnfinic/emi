import vine from '@vinejs/vine'

export const createBusinessValidator = vine.create({
  name: vine.string().minLength(2).maxLength(255),
  slug: vine.string().minLength(2).maxLength(255).regex(/^[a-z0-9-]+$/).optional(),
  type: vine.enum(['standard', 'rotation']).optional(),
  supportsRotations: vine.boolean().optional(),
  currency: vine.string().maxLength(10).optional(),
  address: vine.string().maxLength(500).nullable().optional(),
  phone: vine.string().maxLength(50).nullable().optional(),
})

export const updateBusinessValidator = vine.create({
  name: vine.string().minLength(2).maxLength(255).optional(),
  slug: vine.string().minLength(2).maxLength(255).regex(/^[a-z0-9-]+$/).optional(),
  type: vine.enum(['standard', 'rotation']).optional(),
  supportsRotations: vine.boolean().optional(),
  currency: vine.string().maxLength(10).optional(),
  address: vine.string().maxLength(500).nullable().optional(),
  phone: vine.string().maxLength(50).nullable().optional(),
  isActive: vine.boolean().optional(),
})
