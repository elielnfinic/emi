import Supplier from '#models/supplier'
import { createSupplierValidator, updateSupplierValidator } from '#validators/supplier'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class SuppliersController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const search = ctx.request.input('search', '')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)
    const query = Supplier.query()
      .where('businessId', businessId)
      .orderBy('createdAt', 'desc')
    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('phone', `%${search}%`)
      })
    }
    return await query.paginate(page, perPage)
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
