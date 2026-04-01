import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import Customer from '#models/customer'
import User from '#models/user'
import SaleItem from '#models/sale_item'
import SalePayment from '#models/sale_payment'

export default class Sale extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare businessId: number

  @column()
  declare customerId: number | null

  @column()
  declare userId: number

  @column()
  declare reference: string

  @column()
  declare type: string

  @column()
  declare status: string

  @column()
  declare totalAmount: number

  @column()
  declare paidAmount: number

  @column.date()
  declare date: DateTime

  @column()
  declare notes: string | null

  @column()
  declare rotationId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => SaleItem)
  declare items: HasMany<typeof SaleItem>

  @hasMany(() => SalePayment)
  declare payments: HasMany<typeof SalePayment>
}
