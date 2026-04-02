import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import TransactionCategory from '#models/transaction_category'
import User from '#models/user'
import TransactionAttachment from '#models/transaction_attachment'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare businessId: number

  @column()
  declare categoryId: number | null

  @column()
  declare userId: number

  @column()
  declare reference: string

  @column()
  declare type: string

  @column()
  declare amount: number

  @column()
  declare description: string | null

  @column()
  declare beneficiary: string | null

  @column.date()
  declare date: DateTime

  @column()
  declare rotationId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @belongsTo(() => TransactionCategory, { foreignKey: 'categoryId' })
  declare category: BelongsTo<typeof TransactionCategory>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TransactionAttachment)
  declare attachments: HasMany<typeof TransactionAttachment>
}
