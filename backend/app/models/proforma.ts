import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import Customer from '#models/customer'
import User from '#models/user'
import Sale from '#models/sale'
import ProformaItem from '#models/proforma_item'

export default class Proforma extends BaseModel {
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
  declare status: string

  @column()
  declare totalAmount: number

  @column.date()
  declare date: DateTime

  @column.date()
  declare validUntil: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare saleId: number | null

  @column.dateTime()
  declare sentAt: DateTime | null

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

  @belongsTo(() => Sale)
  declare sale: BelongsTo<typeof Sale>

  @hasMany(() => ProformaItem)
  declare items: HasMany<typeof ProformaItem>
}
