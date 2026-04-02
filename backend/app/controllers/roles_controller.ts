import Role from '#models/role'
import type { HttpContext } from '@adonisjs/core/http'

export default class RolesController {
  async index(_ctx: HttpContext) {
    return Role.query().whereNot('name', 'superadmin').orderBy('id', 'asc')
  }
}
