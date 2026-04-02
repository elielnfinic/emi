import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

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
        .integer('category_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('transaction_categories')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table.string('reference').notNullable()
      table.string('type').notNullable()
      table.decimal('amount', 15, 2).notNullable()
      table.text('description').nullable()
      table.string('beneficiary').nullable()
      table.date('date').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
