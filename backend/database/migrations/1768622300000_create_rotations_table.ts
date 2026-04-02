import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rotations'

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
      table.string('status').defaultTo('open')
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.decimal('initial_capital', 15, 2).defaultTo(0)
      table.timestamp('closed_at').nullable()
      table
        .integer('closed_by')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
