import Supplier from '#models/supplier'
import { createSupplierValidator, updateSupplierValidator } from '#validators/supplier'
import type { HttpContext } from '@adonisjs/core/http'

export default class SuppliersController {
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const query = Supplier.query()
    if (businessId) {
      query.where('businessId', businessId)
    }
    const suppliers = await query.orderBy('name', 'asc')
    return suppliers
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createSupplierValidator)
    const supplier = await Supplier.create(data)
    return supplier
  }

  async show({ params }: HttpContext) {
    const supplier = await Supplier.findOrFail(params.id)
    return supplier
  }

  async update({ params, request }: HttpContext) {
    const supplier = await Supplier.findOrFail(params.id)
    const data = await request.validateUsing(updateSupplierValidator)
    supplier.merge(data)
    await supplier.save()
    return supplier
  }

  async destroy({ params }: HttpContext) {
    const supplier = await Supplier.findOrFail(params.id)
    await supplier.delete()
    return { message: 'Supplier deleted successfully' }
  }
}
