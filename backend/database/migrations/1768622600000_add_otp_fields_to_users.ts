import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('pending_email', 254).nullable()
      table.string('email_otp', 10).nullable()
      table.timestamp('email_otp_expires_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('pending_email')
      table.dropColumn('email_otp')
      table.dropColumn('email_otp_expires_at')
    })
  }
}
