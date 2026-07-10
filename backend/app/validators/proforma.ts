import vine from '@vinejs/vine'

export const createProformaValidator = vine.create({
  businessId: vine.number(),
  customerId: vine.number().nullable().optional(),
  date: vine.string(),
  validUntil: vine.string().nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  items: vine
    .array(
      vine.object({
        stockItemId: vine.number().nullable().optional(),
        name: vine.string().minLength(1).maxLength(255),
        quantity: vine.number().positive(),
        unitPrice: vine.number().min(0),
      })
    )
    .minLength(1),
})

export const updateProformaValidator = vine.create({
  customerId: vine.number().nullable().optional(),
  date: vine.string().optional(),
  validUntil: vine.string().nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  items: vine
    .array(
      vine.object({
        stockItemId: vine.number().nullable().optional(),
        name: vine.string().minLength(1).maxLength(255),
        quantity: vine.number().positive(),
        unitPrice: vine.number().min(0),
      })
    )
    .minLength(1)
    .optional(),
})

export const sendProformaValidator = vine.create({
  email: vine.string().email().optional(),
  message: vine.string().maxLength(2000).nullable().optional(),
})

export const convertProformaValidator = vine.create({
  type: vine.enum(['cash', 'credit']).optional(),
  date: vine.string().optional(),
})
