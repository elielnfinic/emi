import mail from '@adonisjs/mail/services/main'
import Proforma from '#models/proforma'
import ProformaItem from '#models/proforma_item'
import Sale from '#models/sale'
import SaleItem from '#models/sale_item'
import StockItem from '#models/stock_item'
import StockMovement from '#models/stock_movement'
import Transaction from '#models/transaction'
import ProformaMail from '#mails/proforma_mail'
import { buildProformaPdf } from '#services/proforma_pdf_service'
import {
  createProformaValidator,
  updateProformaValidator,
  sendProformaValidator,
  convertProformaValidator,
} from '#validators/proforma'
import { verifyBusinessAccess } from '#services/authorization'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

async function nextReference(businessId: number): Promise<string> {
  const last = await Proforma.query()
    .where('businessId', businessId)
    .orderBy('id', 'desc')
    .first()
  const nextNum = last ? Number.parseInt(last.reference.split('-')[1] || '0') + 1 : 1
  return `PRF-${String(nextNum).padStart(4, '0')}`
}

async function loadForDocument(id: number) {
  return Proforma.query()
    .where('id', id)
    .preload('items')
    .preload('customer')
    .preload('business')
    .firstOrFail()
}

export default class ProformasController {
  async index(ctx: HttpContext) {
    const businessId = ctx.request.input('business_id')
    const customerId = ctx.request.input('customer_id')
    const status = ctx.request.input('status')
    const search = ctx.request.input('search', '')
    const page = ctx.request.input('page', 1)
    const perPage = ctx.request.input('per_page', 20)
    await verifyBusinessAccess(ctx, businessId)

    const query = Proforma.query()
      .where('businessId', businessId)
      .preload('customer')
      .preload('user')
      .preload('items')

    if (customerId) query.where('customerId', customerId)
    if (status) query.where('status', status)
    if (search) {
      query.where((q) => {
        q.whereILike('reference', `%${search}%`).orWhereHas('customer', (cq) => {
          cq.whereILike('name', `%${search}%`)
        })
      })
    }

    return await query.orderBy('date', 'desc').orderBy('createdAt', 'desc').paginate(page, perPage)
  }

  async store(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const data = await ctx.request.validateUsing(createProformaValidator)
    await verifyBusinessAccess(ctx, data.businessId, ['admin', 'manager', 'cashier'])

    const reference = await nextReference(data.businessId)

    let totalAmount = 0
    for (const item of data.items) {
      totalAmount += item.quantity * item.unitPrice
    }

    const proforma = await Proforma.create({
      businessId: data.businessId,
      customerId: data.customerId ?? null,
      userId: user.id,
      reference,
      status: 'draft',
      totalAmount,
      date: DateTime.fromISO(data.date),
      validUntil: data.validUntil ? DateTime.fromISO(data.validUntil) : null,
      notes: data.notes ?? null,
    })

    for (const item of data.items) {
      await ProformaItem.create({
        proformaId: proforma.id,
        stockItemId: item.stockItemId ?? null,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })
    }

    await proforma.load('items')
    await proforma.load('customer')
    await proforma.load('user')
    return proforma
  }

  async show(ctx: HttpContext) {
    const proforma = await Proforma.query()
      .where('id', ctx.params.id)
      .preload('customer')
      .preload('user')
      .preload('items')
      .firstOrFail()
    await verifyBusinessAccess(ctx, proforma.businessId)
    return proforma
  }

  async update(ctx: HttpContext) {
    const proforma = await Proforma.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, proforma.businessId, ['admin', 'manager', 'cashier'])

    if (!['draft', 'sent'].includes(proforma.status)) {
      return ctx.response.unprocessableEntity({
        error: 'Only draft or sent proformas can be edited',
      })
    }

    const data = await ctx.request.validateUsing(updateProformaValidator)

    if (data.customerId !== undefined) proforma.customerId = data.customerId ?? null
    if (data.date) proforma.date = DateTime.fromISO(data.date)
    if (data.validUntil !== undefined) {
      proforma.validUntil = data.validUntil ? DateTime.fromISO(data.validUntil) : null
    }
    if (data.notes !== undefined) proforma.notes = data.notes ?? null

    if (data.items) {
      await ProformaItem.query().where('proformaId', proforma.id).delete()
      let totalAmount = 0
      for (const item of data.items) {
        totalAmount += item.quantity * item.unitPrice
        await ProformaItem.create({
          proformaId: proforma.id,
          stockItemId: item.stockItemId ?? null,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })
      }
      proforma.totalAmount = totalAmount
    }

    await proforma.save()
    await proforma.load('items')
    await proforma.load('customer')
    await proforma.load('user')
    return proforma
  }

  async export(ctx: HttpContext) {
    const proforma = await loadForDocument(ctx.params.id)
    await verifyBusinessAccess(ctx, proforma.businessId)

    const buffer = await buildProformaPdf(proforma)

    ctx.response.header('Content-Type', 'application/pdf')
    ctx.response.header('Content-Disposition', `attachment; filename="${proforma.reference}.pdf"`)
    return ctx.response.send(buffer)
  }

  async send(ctx: HttpContext) {
    const proforma = await loadForDocument(ctx.params.id)
    await verifyBusinessAccess(ctx, proforma.businessId, ['admin', 'manager', 'cashier'])

    const data = await ctx.request.validateUsing(sendProformaValidator)
    const recipient = data.email ?? proforma.customer?.email
    if (!recipient) {
      return ctx.response.unprocessableEntity({
        error: 'No email address available for this customer. Provide one explicitly.',
      })
    }

    const buffer = await buildProformaPdf(proforma)
    await mail.send(new ProformaMail(proforma, buffer, recipient, data.message))

    if (proforma.status === 'draft') proforma.status = 'sent'
    proforma.sentAt = DateTime.now()
    await proforma.save()
    return proforma
  }

  async convert(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const proforma = await Proforma.query()
      .where('id', ctx.params.id)
      .preload('items')
      .firstOrFail()
    await verifyBusinessAccess(ctx, proforma.businessId, ['admin', 'manager', 'cashier'])

    if (!['sent', 'accepted'].includes(proforma.status)) {
      return ctx.response.unprocessableEntity({
        error: 'Only sent or accepted proformas can be converted',
      })
    }

    const data = await ctx.request.validateUsing(convertProformaValidator)
    const saleType = data.type ?? 'cash'
    const saleDate = data.date ? DateTime.fromISO(data.date) : DateTime.now()

    const lastSale = await Sale.query()
      .where('businessId', proforma.businessId)
      .orderBy('id', 'desc')
      .first()
    const nextNum = lastSale ? Number.parseInt(lastSale.reference.split('-')[1] || '0') + 1 : 1
    const reference = `VTE-${String(nextNum).padStart(4, '0')}`

    const sale = await Sale.create({
      businessId: proforma.businessId,
      customerId: proforma.customerId,
      userId: user.id,
      reference,
      type: saleType,
      status: saleType === 'cash' ? 'completed' : 'pending',
      totalAmount: proforma.totalAmount,
      paidAmount: saleType === 'cash' ? proforma.totalAmount : 0,
      date: saleDate,
      notes: `proforma:${proforma.reference}`,
    })

    for (const item of proforma.items) {
      await SaleItem.create({
        saleId: sale.id,
        stockItemId: item.stockItemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })

      if (item.stockItemId) {
        const stockItem = await StockItem.find(item.stockItemId)
        if (stockItem) {
          stockItem.quantity = Number(stockItem.quantity) - Number(item.quantity)
          await stockItem.save()
          await StockMovement.create({
            stockItemId: item.stockItemId,
            businessId: proforma.businessId,
            userId: user.id,
            type: 'out',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            reason: 'sale',
            reference,
            date: saleDate,
          })
        }
      }
    }

    const lastTx = await Transaction.query()
      .where('businessId', proforma.businessId)
      .where('type', 'income')
      .orderBy('id', 'desc')
      .first()
    const txNextNum = lastTx ? Number.parseInt(lastTx.reference.split('-')[1] || '0') + 1 : 1
    const txReference = `ENT-${String(txNextNum).padStart(4, '0')}`
    await Transaction.create({
      businessId: proforma.businessId,
      userId: user.id,
      reference: txReference,
      type: 'income',
      amount: proforma.totalAmount,
      description: `sale:${reference}`,
      date: saleDate,
    })

    proforma.status = 'converted'
    proforma.saleId = sale.id
    await proforma.save()

    await sale.load('items')
    await sale.load('customer')
    return sale
  }

  async destroy(ctx: HttpContext) {
    const proforma = await Proforma.findOrFail(ctx.params.id)
    await verifyBusinessAccess(ctx, proforma.businessId, ['admin', 'manager'])

    if (proforma.status === 'converted') {
      return ctx.response.unprocessableEntity({ error: 'Converted proformas cannot be deleted' })
    }

    await proforma.delete()
    return { message: 'Proforma deleted successfully' }
  }
}
