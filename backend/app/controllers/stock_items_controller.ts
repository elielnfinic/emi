import StockItem from '#models/stock_item'
import { createStockItemValidator, updateStockItemValidator } from '#validators/stock_item'
import type { HttpContext } from '@adonisjs/core/http'

export default class StockItemsController {
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const query = StockItem.query()
    if (businessId) {
      query.where('businessId', businessId)
    }
    const items = await query.orderBy('name', 'asc')
    return items
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createStockItemValidator)
    const item = await StockItem.create(data)
    return item
  }

  async show({ params }: HttpContext) {
    const item = await StockItem.query()
      .where('id', params.id)
      .preload('movements')
      .firstOrFail()
    return item
  }

  async update({ params, request }: HttpContext) {
    const item = await StockItem.findOrFail(params.id)
    const data = await request.validateUsing(updateStockItemValidator)
    item.merge(data)
    await item.save()
    return item
  }

  async destroy({ params }: HttpContext) {
    const item = await StockItem.findOrFail(params.id)
    await item.delete()
    return { message: 'Stock item deleted successfully' }
  }
}
