import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import User from '#models/user'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    const role = await Role.firstOrCreate(
      { name: 'superadmin' },
      { name: 'superadmin', displayName: 'Super Admin', description: 'Full system access' }
    )

    await User.updateOrCreate(
      { email: 'elimek2@gmail.com' },
      { email: 'elimek2@gmail.com', password: '12345', roleId: role.id }
    )
  }
}
