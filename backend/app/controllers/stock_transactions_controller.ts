import StockMovement from '#models/stock_movement'
import StockItem from '#models/stock_item'
import {
  createStockTransactionValidator,
  updateStockTransactionValidator,
  bulkMoveRotationValidator,
} from '#validators/stock_transaction'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class StockTransactionsController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const stockItemId = ctx.request.input('stock_item_id')
    const type = ctx.request.input('type')
    const rotationId = ctx.request.input('rotation_id')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)

    const query = StockMovement.query()
      .where('businessId', businessId)
      .preload('stockItem')
      .preload('user')

    if (stockItemId) query.where('stockItemId', stockItemId)
    if (type) query.where('type', type)
    if (rotationId) query.where('rotationId', rotationId)

    return await query.orderBy('date', 'desc').orderBy('createdAt', 'desc').paginate(page, perPage)
  }

  async store(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const data = await ctx.request.validateUsing(createStockTransactionValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager', 'stock'])

    // Verify stock item exists and belongs to business
    const stockItem = await StockItem.query()
      .where('id', data.stockItemId)
      .where('businessId', data.businessId)
      .firstOrFail()

    const movement = await StockMovement.create({
      stockItemId: data.stockItemId,
      businessId: data.businessId,
      userId: user.id,
      type: data.type,
      quantity: data.quantity,
      unitPrice: data.unitPrice ?? null,
      supplierId: data.supplierId ?? null,
      rotationId: data.rotationId ?? null,
      reason: data.type === 'in' ? 'stock_in' : data.type === 'out' ? 'stock_out' : 'adjustment',
      date: data.date ? DateTime.fromISO(data.date) : DateTime.now(),
      notes: data.notes ?? null,
    })

    // Update stock item quantity
    if (data.type === 'in') {
      stockItem.quantity = Number(stockItem.quantity) + data.quantity
    } else if (data.type === 'out') {
      stockItem.quantity = Number(stockItem.quantity) - data.quantity
    } else {
      // adjustment: set absolute value difference
      stockItem.quantity = Number(stockItem.quantity) + data.quantity
    }

    // Update purchase price if this is a stock-in
    if (data.type === 'in' && data.unitPrice != null) {
      stockItem.purchasePrice = data.unitPrice
    }

    await stockItem.save()

    await movement.load('stockItem')
    await movement.load('user')
    return movement
  }

  async show(ctx: HttpContext) {
    const movement = await StockMovement.query()
      .where('id', ctx.params.id)
      .preload('stockItem')
      .preload('user')
      .firstOrFail()
    await verifyBusinessAccess(ctx, movement.businessId)
    return movement
  }

  async update(ctx: HttpContext) {
    const movement = await StockMovement.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, movement.businessId, ['admin', 'manager', 'stock'])

    const stockItem = await StockItem.findOrFail(movement.stockItemId)
    const data = await ctx.request.validateUsing(updateStockTransactionValidator)

    // Reverse old quantity effect
    if (movement.type === 'in') {
      stockItem.quantity = Number(stockItem.quantity) - Number(movement.quantity)
    } else if (movement.type === 'out') {
      stockItem.quantity = Number(stockItem.quantity) + Number(movement.quantity)
    } else {
      stockItem.quantity = Number(stockItem.quantity) - Number(movement.quantity)
    }

    // Apply updates
    if (data.type !== undefined) movement.type = data.type
    if (data.quantity !== undefined) movement.quantity = data.quantity
    if (data.unitPrice !== undefined) movement.unitPrice = data.unitPrice ?? null
    if (data.supplierId !== undefined) movement.supplierId = data.supplierId ?? null
    if (data.rotationId !== undefined) movement.rotationId = data.rotationId ?? null
    if (data.notes !== undefined) movement.notes = data.notes ?? null
    if (data.date) movement.date = DateTime.fromISO(data.date)

    // Apply new quantity effect
    if (movement.type === 'in') {
      stockItem.quantity = Number(stockItem.quantity) + Number(movement.quantity)
    } else if (movement.type === 'out') {
      stockItem.quantity = Number(stockItem.quantity) - Number(movement.quantity)
    } else {
      stockItem.quantity = Number(stockItem.quantity) + Number(movement.quantity)
    }

    await stockItem.save()
    await movement.save()
    await movement.load('stockItem')
    await movement.load('user')
    return movement
  }

  async destroy(ctx: HttpContext) {
    const movement = await StockMovement.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, movement.businessId, ['admin', 'manager'])

    // Reverse quantity effect
    const stockItem = await StockItem.findOrFail(movement.stockItemId)
    if (movement.type === 'in') {
      stockItem.quantity = Number(stockItem.quantity) - Number(movement.quantity)
    } else if (movement.type === 'out') {
      stockItem.quantity = Number(stockItem.quantity) + Number(movement.quantity)
    } else {
      stockItem.quantity = Number(stockItem.quantity) - Number(movement.quantity)
    }
    await stockItem.save()
    await movement.delete()
    return { message: 'Stock transaction deleted successfully' }
  }

  async bulkMoveRotation(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(bulkMoveRotationValidator)

    if (data.transactionIds.length === 0) {
      return { message: 'No transactions to move', updated: 0 }
    }

    const firstMovement = await StockMovement.findOrFail(data.transactionIds[0])
    await verifyBusinessAccess(ctx, firstMovement.businessId, ['admin', 'manager'])

    let updated = 0
    for (const id of data.transactionIds) {
      const movement = await StockMovement.find(id)
      if (movement && movement.businessId === firstMovement.businessId) {
        movement.rotationId = data.rotationId
        await movement.save()
        updated++
      }
    }

    return { message: `${updated} transactions moved successfully`, updated }
  }
}
