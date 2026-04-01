import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StockItem from '#models/stock_item'
import Business from '#models/business'
import User from '#models/user'

export default class StockMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare stockItemId: number

  @column()
  declare businessId: number

  @column()
  declare userId: number

  @column()
  declare type: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number | null

  @column()
  declare reason: string | null

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

  @belongsTo(() => StockItem)
  declare stockItem: BelongsTo<typeof StockItem>

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
