import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisition_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('requisition_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('requisitions')
        .onDelete('CASCADE')
      table
        .integer('stock_item_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('stock_items')
      table.string('name').notNullable()
      table.decimal('quantity', 15, 2).notNullable()
      table.decimal('estimated_unit_price', 15, 2).nullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
