import Requisition from '#models/requisition'
import RequisitionItem from '#models/requisition_item'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import Transaction from '#models/transaction'
import {
  createRequisitionValidator,
  updateRequisitionValidator,
  rejectRequisitionValidator,
} from '#validators/requisition'
import { verifyBusinessAccess } from '#services/authorization'
import { buildRequisitionPdf } from '#services/requisition_pdf_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

async function nextReference(businessId: number): Promise<string> {
  const last = await Requisition.query()
    .where('businessId', businessId)
    .orderBy('id', 'desc')
    .first()
  const nextNum = last ? Number.parseInt(last.reference.split('-')[1] || '0') + 1 : 1
  return `REQ-${String(nextNum).padStart(4, '0')}`
}

export default class RequisitionsController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const status = ctx.request.input('status')
    const supplierId = ctx.request.input('supplier_id')
    const search = ctx.request.input('search', '')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)

    const query = Requisition.query()
      .where('businessId', businessId)
      .preload('supplier')
      .preload('user')
      .preload('approvedBy')
      .preload('items')

    if (status) query.where('status', status)
    if (supplierId) query.where('supplierId', supplierId)
    if (search) query.whereILike('reference', `%${search}%`)

    return await query.orderBy('date', 'desc').orderBy('createdAt', 'desc').paginate(page, perPage)
  }

  async store(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const data = await ctx.request.validateUsing(createRequisitionValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager', 'stock'])

    const reference = await nextReference(data.businessId)

    let totalAmount = 0
    for (const item of data.items) {
      totalAmount += item.quantity * (item.estimatedUnitPrice ?? 0)
    }

    const requisition = await Requisition.create({
      businessId: data.businessId,
      supplierId: data.supplierId ?? null,
      userId: user.id,
      reference,
      status: 'draft',
      totalAmount,
      date: DateTime.fromISO(data.date),
      neededByDate: data.neededByDate ? DateTime.fromISO(data.neededByDate) : null,
      notes: data.notes ?? null,
    })

    for (const item of data.items) {
      await RequisitionItem.create({
        requisitionId: requisition.id,
        stockItemId: item.stockItemId ?? null,
        name: item.name,
        quantity: item.quantity,
        estimatedUnitPrice: item.estimatedUnitPrice ?? null,
      })
    }

    await requisition.load('items')
    await requisition.load('supplier')
    await requisition.load('user')
    return requisition
  }

  async show(ctx: HttpContext) {
    const requisition = await Requisition.query()
      .where('id', ctx.params.id)
      .preload('supplier')
      .preload('user')
      .preload('approvedBy')
      .preload('items')
      .firstOrFail()
    await verifyBusinessAccess(ctx, requisition.businessId)
    return requisition
  }

  async export(ctx: HttpContext) {
    const requisition = await Requisition.query()
      .where('id', ctx.params.id)
      .preload('items')
      .preload('supplier')
      .preload('user')
      .preload('approvedBy')
      .preload('business')
      .firstOrFail()
    await verifyBusinessAccess(ctx, requisition.businessId)

    const flag = (name: string) => ctx.request.input(name, '1') !== '0'
    const buffer = await buildRequisitionPdf(requisition, {
      includeEmail: flag('include_email'),
      includeName: flag('include_name'),
      includeSupplier: flag('include_supplier'),
      includeNeededBy: flag('include_needed_by'),
    })

    ctx.response.header('Content-Type', 'application/pdf')
    ctx.response.header('Content-Disposition', `attachment; filename="${requisition.reference}.pdf"`)
    return ctx.response.send(buffer)
  }

  async update(ctx: HttpContext) {
    const requisition = await Requisition.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, requisition.businessId, ['admin', 'manager', 'stock'])

    if (requisition.status !== 'draft') {
      return ctx.response.unprocessableEntity({
        error: 'Only draft requisitions can be edited',
      })
    }

    const data = await ctx.request.validateUsing(updateRequisitionValidator)

    if (data.supplierId !== undefined) requisition.supplierId = data.supplierId ?? null
    if (data.date) requisition.date = DateTime.fromISO(data.date)
    if (data.neededByDate !== undefined) {
      requisition.neededByDate = data.neededByDate ? DateTime.fromISO(data.neededByDate) : null
    }
    if (data.notes !== undefined) requisition.notes = data.notes ?? null

    if (data.items) {
      await RequisitionItem.query().where('requisitionId', requisition.id).delete()
      let totalAmount = 0
      for (const item of data.items) {
        totalAmount += item.quantity * (item.estimatedUnitPrice ?? 0)
        await RequisitionItem.create({
          requisitionId: requisition.id,
          stockItemId: item.stockItemId ?? null,
          name: item.name,
          quantity: item.quantity,
          estimatedUnitPrice: item.estimatedUnitPrice ?? null,
        })
      }
      requisition.totalAmount = totalAmount
    }

    await requisition.save()
    await requisition.load('items')
    await requisition.load('supplier')
    await requisition.load('user')
    return requisition
  }

  async submit(ctx: HttpContext) {
    const requisition = await Requisition.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, requisition.businessId, ['admin', 'manager', 'stock'])

    if (requisition.status !== 'draft') {
      return ctx.response.unprocessableEntity({ error: 'Only draft requisitions can be submitted' })
    }

    requisition.status = 'pending'
    await requisition.save()
    return requisition
  }

  async approve(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const requisition = await Requisition.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, requisition.businessId, ['admin', 'manager'])

    if (requisition.status !== 'pending') {
      return ctx.response.unprocessableEntity({ error: 'Only pending requisitions can be approved' })
    }

    requisition.status = 'approved'
    requisition.approvedById = user.id
    await requisition.save()
    return requisition
  }

  async reject(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const requisition = await Requisition.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, requisition.businessId, ['admin', 'manager'])

    if (requisition.status !== 'pending') {
      return ctx.response.unprocessableEntity({ error: 'Only pending requisitions can be rejected' })
    }

    const data = await ctx.request.validateUsing(rejectRequisitionValidator)
    requisition.status = 'rejected'
    requisition.approvedById = user.id
    requisition.rejectionReason = data.rejectionReason ?? null
    await requisition.save()
    return requisition
  }

  async convert(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const requisition = await Requisition.query()
      .where('id', ctx.params.id)
      .preload('items')
      .firstOrFail()
    await verifyBusinessAccess(ctx, requisition.businessId, ['admin', 'manager', 'stock'])

    if (requisition.status !== 'approved') {
      return ctx.response.unprocessableEntity({
        error: 'Only approved requisitions can be converted',
      })
    }

    const movementDate = DateTime.now()
    let totalExpense = 0

    for (const item of requisition.items) {
      if (!item.stockItemId) continue
      const stockItem = await StockItem.find(item.stockItemId)
      if (!stockItem) continue

      const unitPrice = item.estimatedUnitPrice ?? 0
      stockItem.quantity = Number(stockItem.quantity) + Number(item.quantity)
      if (unitPrice > 0) stockItem.purchasePrice = unitPrice
      await stockItem.save()

      await StockMovement.create({
        stockItemId: item.stockItemId,
        businessId: requisition.businessId,
        userId: user.id,
        type: 'in',
        quantity: item.quantity,
        unitPrice: item.estimatedUnitPrice,
        supplierId: requisition.supplierId,
        reason: 'requisition',
        reference: requisition.reference,
        date: movementDate,
      })

      totalExpense += Number(item.quantity) * unitPrice
    }

    if (totalExpense > 0) {
      const lastTx = await Transaction.query()
        .where('businessId', requisition.businessId)
        .where('type', 'expense')
        .orderBy('id', 'desc')
        .first()
      const txNextNum = lastTx ? Number.parseInt(lastTx.reference.split('-')[1] || '0') + 1 : 1
      const txReference = `SOR-${String(txNextNum).padStart(4, '0')}`
      await Transaction.create({
        businessId: requisition.businessId,
        userId: user.id,
        reference: txReference,
        type: 'expense',
        amount: totalExpense,
        description: `requisition:${requisition.reference}`,
        date: movementDate,
      })
    }

    requisition.status = 'converted'
    await requisition.save()
    return requisition
  }

  async destroy(ctx: HttpContext) {
    const requisition = await Requisition.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, requisition.businessId, ['admin', 'manager'])

    if (requisition.status === 'converted') {
      return ctx.response.unprocessableEntity({ error: 'Converted requisitions cannot be deleted' })
    }

    await requisition.delete()
    return { message: 'Requisition deleted successfully' }
  }
}
