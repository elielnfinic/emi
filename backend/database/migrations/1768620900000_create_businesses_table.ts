import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'businesses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('organization_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('organizations')
      table.string('name').notNullable()
      table.string('slug').notNullable()
      table.string('type').defaultTo('standard')
      table.boolean('supports_rotations').defaultTo(false)
      table.string('currency').defaultTo('USD')
      table.string('address').nullable()
      table.string('phone').nullable()
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['organization_id', 'slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
