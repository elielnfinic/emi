import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sale_payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('sale_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('sales')
        .onDelete('CASCADE')
      table.decimal('amount', 15, 2).notNullable()
      table.string('payment_method').defaultTo('cash')
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
