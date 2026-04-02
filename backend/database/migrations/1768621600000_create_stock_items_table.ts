import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('business_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('businesses')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('sku').nullable()
      table.text('description').nullable()
      table.string('unit').defaultTo('piece')
      table.decimal('purchase_price', 15, 2).nullable()
      table.decimal('selling_price', 15, 2).nullable()
      table.decimal('quantity', 15, 2).defaultTo(0)
      table.decimal('min_quantity', 15, 2).defaultTo(0)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
