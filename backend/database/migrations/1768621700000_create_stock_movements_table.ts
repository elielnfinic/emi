import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('stock_item_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('stock_items')
        .onDelete('CASCADE')
      table
        .integer('business_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('businesses')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table.string('type').notNullable()
      table.decimal('quantity', 15, 2).notNullable()
      table.decimal('unit_price', 15, 2).nullable()
      table.string('reason').nullable()
      table.string('reference').nullable()
      table.date('date').notNullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
