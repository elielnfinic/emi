import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'proformas'

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
        .integer('customer_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('customers')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table.string('reference').notNullable()
      table.string('status').notNullable().defaultTo('draft')
      table.decimal('total_amount', 15, 2).notNullable()
      table.date('date').notNullable()
      table.date('valid_until').nullable()
      table.text('notes').nullable()
      table
        .integer('sale_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('sales')
      table.timestamp('sent_at').nullable()
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
