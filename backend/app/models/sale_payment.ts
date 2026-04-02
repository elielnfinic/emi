import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sale from '#models/sale'

export default class SalePayment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare saleId: number

  @column()
  declare amount: number

  @column()
  declare paymentMethod: string

  @column()
  declare reference: string | null

  @column.date()
  declare date: DateTime

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Sale)
  declare sale: BelongsTo<typeof Sale>
}
