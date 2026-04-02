import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('organization_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('organizations')
      table
        .integer('role_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('roles')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('organization_id')
      table.dropColumn('role_id')
    })
  }
}
