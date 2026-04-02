import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('transactions', (table) => {
      table
        .integer('rotation_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('rotations')
    })

    this.schema.alterTable('sales', (table) => {
      table
        .integer('rotation_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('rotations')
    })
  }

  async down() {
    this.schema.alterTable('transactions', (table) => {
      table.dropColumn('rotation_id')
    })

    this.schema.alterTable('sales', (table) => {
      table.dropColumn('rotation_id')
    })
  }
}
