import Supplier from '#models/supplier'
import { createSupplierValidator, updateSupplierValidator } from '#validators/supplier'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class SuppliersController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    await verifyBusinessAccess(ctx, businessId)
    const suppliers = await Supplier.query()
      .where('businessId', businessId)
      .orderBy('name', 'asc')
    return suppliers
  }

  async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(createSupplierValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager'])
    const supplier = await Supplier.create(data)
    return supplier
  }

  async show(ctx: HttpContext) {
    const supplier = await Supplier.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, supplier.businessId)
    return supplier
  }

  async update(ctx: HttpContext) {
    const supplier = await Supplier.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, supplier.businessId, ['admin', 'manager'])
    const data = await ctx.request.validateUsing(updateSupplierValidator)
    supplier.merge(data)
    await supplier.save()
    return supplier
  }

  async destroy(ctx: HttpContext) {
    const supplier = await Supplier.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, supplier.businessId, ['admin', 'manager'])
    await supplier.delete()
    return { message: 'Supplier deleted successfully' }
  }
}
