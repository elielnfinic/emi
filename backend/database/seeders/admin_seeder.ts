import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import User from '#models/user'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    // Business-level roles (IDs must match the frontend ROLES constants)
    await Role.firstOrCreate(
      { name: 'admin' },
      { name: 'admin', displayName: 'Admin', description: 'Full business access' }
    )
    await Role.firstOrCreate(
      { name: 'manager' },
      { name: 'manager', displayName: 'Manager', description: 'Manage most business features' }
    )
    await Role.firstOrCreate(
      { name: 'cashier' },
      { name: 'cashier', displayName: 'Cashier', description: 'Handle sales and customers' }
    )
    await Role.firstOrCreate(
      { name: 'stock' },
      { name: 'stock', displayName: 'Stock', description: 'Manage stock items' }
    )

    // System-level superadmin role
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
