import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import Supplier from '#models/supplier'
import User from '#models/user'
import RequisitionItem from '#models/requisition_item'

export default class Requisition extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare businessId: number

  @column()
  declare supplierId: number | null

  @column()
  declare userId: number

  @column()
  declare approvedById: number | null

  @column()
  declare reference: string

  @column()
  declare status: string

  @column()
  declare totalAmount: number

  @column.date()
  declare date: DateTime

  @column.date()
  declare neededByDate: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare rotationId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'approvedById' })
  declare approvedBy: BelongsTo<typeof User>

  @hasMany(() => RequisitionItem)
  declare items: HasMany<typeof RequisitionItem>
}
