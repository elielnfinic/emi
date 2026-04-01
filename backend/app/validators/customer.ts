import vine from '@vinejs/vine'

export const createCustomerValidator = vine.create({
  businessId: vine.number(),
  name: vine.string().minLength(1).maxLength(255),
  email: vine.string().email().maxLength(254).nullable().optional(),
  phone: vine.string().maxLength(50).nullable().optional(),
  address: vine.string().maxLength(500).nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
})

export const updateCustomerValidator = vine.create({
  name: vine.string().minLength(1).maxLength(255).optional(),
  email: vine.string().email().maxLength(254).nullable().optional(),
  phone: vine.string().maxLength(50).nullable().optional(),
  address: vine.string().maxLength(500).nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
})
