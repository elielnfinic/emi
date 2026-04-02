import Customer from '#models/customer'
import { createCustomerValidator, updateCustomerValidator } from '#validators/customer'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class CustomersController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const search = ctx.request.input('search', '')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)
    const query = Customer.query()
      .where('businessId', businessId)
      .orderBy('name', 'asc')
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
    const data = await ctx.request.validateUsing(createCustomerValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager', 'cashier'])
    const customer = await Customer.create(data)
    return customer
  }

  async show(ctx: HttpContext) {
    const customer = await Customer.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, customer.businessId)
    return customer
  }

  async update(ctx: HttpContext) {
    const customer = await Customer.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, customer.businessId, ['admin', 'manager'])
    const data = await ctx.request.validateUsing(updateCustomerValidator)
    customer.merge(data)
    await customer.save()
    return customer
  }

  async destroy(ctx: HttpContext) {
    const customer = await Customer.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, customer.businessId, ['admin', 'manager'])
    await customer.delete()
    return { message: 'Customer deleted successfully' }
  }
}
