import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import Transaction from '#models/transaction'
import { createStockItemValidator, updateStockItemValidator } from '#validators/stock_item'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'

export default class StockItemsController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const search = ctx.request.input('search', '')
    const category = ctx.request.input('category', '')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)
    const query = StockItem.query()
      .where('businessId', businessId)
      .orderBy('name', 'asc')
    if (search) {
      query.where((q) => {
        q.whereILike('name', `%${search}%`)
          .orWhereILike('sku', `%${search}%`)
      })
    }
    if (category) {
      query.where('category', category)
    }
    return await query.paginate(page, perPage)
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
      .preload('movements', (q) => q.orderBy('date', 'desc').orderBy('createdAt', 'desc'))
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

    // Delete expense transactions linked to stock-in movements for this product.
    // The DB cascades the deletion of StockMovement records when the item is
    // deleted, so we must clean up the linked Transaction records beforehand —
    // otherwise they remain as orphaned expense entries in the transaction list.
    const inMovements = await StockMovement.query()
      .where('stockItemId', item.id)
      .where('type', 'in')
      .select('id')

    if (inMovements.length > 0) {
      const descriptions = inMovements.map((m) => `stock_movement:${m.id}`)
      await Transaction.query()
        .where('businessId', item.businessId)
        .whereIn('description', descriptions)
        .delete()
    }

    // Deleting the item cascades to its StockMovement records in the DB
    await item.delete()
    return { message: 'Stock item deleted successfully' }
  }

  async categories(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    await verifyBusinessAccess(ctx, businessId)
    const items = await StockItem.query()
      .where('businessId', businessId)
      .whereNotNull('category')
      .select('category')
      .groupBy('category')
    return items.map((i) => i.category).filter(Boolean)
  }
}
