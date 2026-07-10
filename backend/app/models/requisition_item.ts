import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Requisition from '#models/requisition'
import StockItem from '#models/stock_item'

export default class RequisitionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisitionId: number

  @column()
  declare stockItemId: number | null

  @column()
  declare name: string

  @column()
  declare quantity: number

  @column()
  declare estimatedUnitPrice: number | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Requisition)
  declare requisition: BelongsTo<typeof Requisition>

  @belongsTo(() => StockItem)
  declare stockItem: BelongsTo<typeof StockItem>
}
