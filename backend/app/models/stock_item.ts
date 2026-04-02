import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import StockMovement from '#models/stock_movement'

export default class StockItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare businessId: number

  @column()
  declare name: string

  @column()
  declare sku: string | null

  @column()
  declare description: string | null

  @column()
  declare unit: string

  @column()
  declare purchasePrice: number | null

  @column()
  declare sellingPrice: number | null

  @column()
  declare quantity: number

  @column()
  declare minQuantity: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @hasMany(() => StockMovement)
  declare movements: HasMany<typeof StockMovement>
}
