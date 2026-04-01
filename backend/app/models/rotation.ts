import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import Transaction from '#models/transaction'
import Sale from '#models/sale'

export default class Rotation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare businessId: number

  @column()
  declare name: string

  @column()
  declare status: string

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare initialCapital: number

  @column.dateTime()
  declare closedAt: DateTime | null

  @column()
  declare closedBy: number | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @hasMany(() => Sale)
  declare sales: HasMany<typeof Sale>
}
