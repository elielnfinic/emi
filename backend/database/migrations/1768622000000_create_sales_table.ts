import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

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
      table.string('type').notNullable()
      table.string('status').defaultTo('completed')
      table.decimal('total_amount', 15, 2).notNullable()
      table.decimal('paid_amount', 15, 2).defaultTo(0)
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
