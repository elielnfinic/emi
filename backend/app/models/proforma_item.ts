import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Proforma from '#models/proforma'
import StockItem from '#models/stock_item'

export default class ProformaItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare proformaId: number

  @column()
  declare stockItemId: number | null

  @column()
  declare name: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare totalPrice: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Proforma)
  declare proforma: BelongsTo<typeof Proforma>

  @belongsTo(() => StockItem)
  declare stockItem: BelongsTo<typeof StockItem>
}
