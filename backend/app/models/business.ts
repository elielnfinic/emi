import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Organization from '#models/organization'
import BusinessUser from '#models/business_user'
import Transaction from '#models/transaction'
import StockItem from '#models/stock_item'
import Customer from '#models/customer'
import Supplier from '#models/supplier'
import Sale from '#models/sale'
import Rotation from '#models/rotation'

export default class Business extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare organizationId: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare type: string

  @column()
  declare supportsRotations: boolean

  @column()
  declare currency: string

  @column()
  declare address: string | null

  @column()
  declare phone: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  @hasMany(() => BusinessUser)
  declare businessUsers: HasMany<typeof BusinessUser>

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @hasMany(() => StockItem)
  declare stockItems: HasMany<typeof StockItem>

  @hasMany(() => Customer)
  declare customers: HasMany<typeof Customer>

  @hasMany(() => Supplier)
  declare suppliers: HasMany<typeof Supplier>

  @hasMany(() => Sale)
  declare sales: HasMany<typeof Sale>

  @hasMany(() => Rotation)
  declare rotations: HasMany<typeof Rotation>
}
