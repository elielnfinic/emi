import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisitions'

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
      table
        .integer('supplier_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('suppliers')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table
        .integer('approved_by_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table.string('reference').notNullable()
      table.string('status').notNullable().defaultTo('draft')
      table.decimal('total_amount', 15, 2).notNullable().defaultTo(0)
      table.date('date').notNullable()
      table.date('needed_by_date').nullable()
      table.text('notes').nullable()
      table.text('rejection_reason').nullable()
      table
        .integer('rotation_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('rotations')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
