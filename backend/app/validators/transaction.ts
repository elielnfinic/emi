import vine from '@vinejs/vine'

export const createTransactionValidator = vine.create({
  businessId: vine.number(),
  categoryId: vine.number().nullable().optional(),
  type: vine.enum(['income', 'expense']),
  amount: vine.number().positive(),
  description: vine.string().maxLength(1000).nullable().optional(),
  beneficiary: vine.string().maxLength(255).nullable().optional(),
  date: vine.string(),
})

export const updateTransactionValidator = vine.create({
  categoryId: vine.number().nullable().optional(),
  type: vine.enum(['income', 'expense']).optional(),
  amount: vine.number().positive().optional(),
  description: vine.string().maxLength(1000).nullable().optional(),
  beneficiary: vine.string().maxLength(255).nullable().optional(),
  date: vine.string().optional(),
})
