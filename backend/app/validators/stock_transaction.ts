import vine from '@vinejs/vine'

export const createStockTransactionValidator = vine.create({
  businessId: vine.number(),
  stockItemId: vine.number(),
  type: vine.enum(['in', 'out', 'adjustment']),
  quantity: vine.number().min(0.01),
  unitPrice: vine.number().min(0).nullable().optional(),
  supplierId: vine.number().nullable().optional(),
  rotationId: vine.number().nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  date: vine.string().optional(),
})

export const updateStockTransactionValidator = vine.create({
  type: vine.enum(['in', 'out', 'adjustment']).optional(),
  quantity: vine.number().min(0.01).optional(),
  unitPrice: vine.number().min(0).nullable().optional(),
  supplierId: vine.number().nullable().optional(),
  rotationId: vine.number().nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  date: vine.string().optional(),
})

export const bulkMoveRotationValidator = vine.create({
  transactionIds: vine.array(vine.number()),
  rotationId: vine.number().nullable(),
})
