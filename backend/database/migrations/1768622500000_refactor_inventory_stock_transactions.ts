import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('stock_items', (table) => {
      table.string('category', 100).nullable()
    })

    this.schema.alterTable('stock_movements', (table) => {
      table
        .integer('rotation_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('rotations')
      table
        .integer('supplier_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('suppliers')
    })
  }

  async down() {
    this.schema.alterTable('stock_items', (table) => {
      table.dropColumn('category')
    })

    this.schema.alterTable('stock_movements', (table) => {
      table.dropColumn('rotation_id')
      table.dropColumn('supplier_id')
    })
  }
}
