import vine from '@vinejs/vine'

export const createStockItemValidator = vine.create({
  businessId: vine.number(),
  name: vine.string().minLength(1).maxLength(255),
  sku: vine.string().maxLength(100).nullable().optional(),
  description: vine.string().maxLength(1000).nullable().optional(),
  unit: vine.string().maxLength(50).optional(),
  purchasePrice: vine.number().min(0).nullable().optional(),
  sellingPrice: vine.number().min(0).nullable().optional(),
  quantity: vine.number().min(0).optional(),
  minQuantity: vine.number().min(0).optional(),
})

export const updateStockItemValidator = vine.create({
  name: vine.string().minLength(1).maxLength(255).optional(),
  sku: vine.string().maxLength(100).nullable().optional(),
  description: vine.string().maxLength(1000).nullable().optional(),
  unit: vine.string().maxLength(50).optional(),
  purchasePrice: vine.number().min(0).nullable().optional(),
  sellingPrice: vine.number().min(0).nullable().optional(),
  quantity: vine.number().min(0).optional(),
  minQuantity: vine.number().min(0).optional(),
  isActive: vine.boolean().optional(),
})
