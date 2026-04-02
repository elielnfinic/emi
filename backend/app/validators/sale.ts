import vine from '@vinejs/vine'

export const createSaleValidator = vine.create({
  businessId: vine.number(),
  customerId: vine.number().nullable().optional(),
  type: vine.enum(['cash', 'credit']),
  date: vine.string(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  items: vine.array(
    vine.object({
      stockItemId: vine.number().nullable().optional(),
      name: vine.string().minLength(1).maxLength(255),
      quantity: vine.number().positive(),
      unitPrice: vine.number().min(0),
    })
  ).minLength(1),
})

export const createSalePaymentValidator = vine.create({
  saleId: vine.number(),
  amount: vine.number().positive(),
  paymentMethod: vine.enum(['cash', 'transfer', 'mobile_money']).optional(),
  reference: vine.string().maxLength(255).nullable().optional(),
  date: vine.string(),
  notes: vine.string().maxLength(1000).nullable().optional(),
})
