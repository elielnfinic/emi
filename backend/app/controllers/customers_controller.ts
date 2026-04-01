import Customer from '#models/customer'
import { createCustomerValidator, updateCustomerValidator } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'

export default class CustomersController {
  async index({ request }: HttpContext) {
    const businessId = request.input('business_id')
    const query = Customer.query()
    if (businessId) {
      query.where('businessId', businessId)
    }
    const customers = await query.orderBy('name', 'asc')
    return customers
  }

  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createCustomerValidator)
    const customer = await Customer.create(data)
    return customer
  }

  async show({ params }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    return customer
  }

  async update({ params, request }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    const data = await request.validateUsing(updateCustomerValidator)
    customer.merge(data)
    await customer.save()
    return customer
  }

  async destroy({ params }: HttpContext) {
    const customer = await Customer.findOrFail(params.id)
    await customer.delete()
    return { message: 'Customer deleted successfully' }
  }
}
