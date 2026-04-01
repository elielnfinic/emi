import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Business from '#models/business'
import User from '#models/user'
import Role from '#models/role'

export default class BusinessUser extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare businessId: number

  @column()
  declare userId: number

  @column()
  declare roleId: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Business)
  declare business: BelongsTo<typeof Business>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>
}
