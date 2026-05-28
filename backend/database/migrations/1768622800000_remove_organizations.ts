import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Drop organization_id from businesses
    this.schema.alterTable('businesses', (table) => {
      table.dropColumn('organization_id')
    })

    // 2. Drop organization_id from users
    this.schema.alterTable('users', (table) => {
      table.dropColumn('organization_id')
    })

    // 3. Drop the organizations table
    this.schema.dropTableIfExists('organizations')
  }

  async down() {
    // Recreate organizations table
    this.schema.createTable('organizations', (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.string('slug', 255).notNullable().unique()
      table.string('logo_url', 500).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })

    // Re-add organization_id to businesses
    this.schema.alterTable('businesses', (table) => {
      table.integer('organization_id').unsigned().nullable().references('id').inTable('organizations').onDelete('CASCADE')
    })

    // Re-add organization_id to users
    this.schema.alterTable('users', (table) => {
      table.integer('organization_id').unsigned().nullable().references('id').inTable('organizations').onDelete('SET NULL')
    })
  }
}
