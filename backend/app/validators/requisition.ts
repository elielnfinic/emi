import vine from '@vinejs/vine'

export const createRequisitionValidator = vine.create({
  businessId: vine.number(),
  supplierId: vine.number().nullable().optional(),
  date: vine.string(),
  neededByDate: vine.string().nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  items: vine
    .array(
      vine.object({
        stockItemId: vine.number().nullable().optional(),
        name: vine.string().minLength(1).maxLength(255),
        quantity: vine.number().positive(),
        estimatedUnitPrice: vine.number().min(0).nullable().optional(),
      })
    )
    .minLength(1),
})

export const updateRequisitionValidator = vine.create({
  supplierId: vine.number().nullable().optional(),
  date: vine.string().optional(),
  neededByDate: vine.string().nullable().optional(),
  notes: vine.string().maxLength(1000).nullable().optional(),
  items: vine
    .array(
      vine.object({
        stockItemId: vine.number().nullable().optional(),
        name: vine.string().minLength(1).maxLength(255),
        quantity: vine.number().positive(),
        estimatedUnitPrice: vine.number().min(0).nullable().optional(),
      })
    )
    .minLength(1)
    .optional(),
})

export const rejectRequisitionValidator = vine.create({
  rejectionReason: vine.string().maxLength(1000).nullable().optional(),
})
