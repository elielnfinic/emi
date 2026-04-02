import StockItem from '#models/stock_item'
import { createStockItemValidator, updateStockItemValidator } from '#validators/stock_item'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class StockItemsController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    await verifyBusinessAccess(ctx, businessId)
    const items = await StockItem.query()
      .where('businessId', businessId)
      .orderBy('name', 'asc')
    return items
  }

  async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(createStockItemValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager', 'stock'])
    const item = await StockItem.create(data)
    return item
  }

  async show(ctx: HttpContext) {
    const item = await StockItem.query()
      .where('id', ctx.params.id)
      .preload('movements')
      .firstOrFail()
    await verifyBusinessAccess(ctx, item.businessId)
    return item
  }

  async update(ctx: HttpContext) {
    const item = await StockItem.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, item.businessId, ['admin', 'manager', 'stock'])
    const data = await ctx.request.validateUsing(updateStockItemValidator)
    item.merge(data)
    await item.save()
    return item
  }

  async destroy(ctx: HttpContext) {
    const item = await StockItem.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, item.businessId, ['admin', 'manager'])
    await item.delete()
    return { message: 'Stock item deleted successfully' }
  }
}
