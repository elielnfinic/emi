import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.update_profile': { paramsTuple?: []; params?: {} }
    'profile.profile.update_password': { paramsTuple?: []; params?: {} }
    'profile.profile.request_email_change': { paramsTuple?: []; params?: {} }
    'profile.profile.verify_email_change': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'businesses.index': { paramsTuple?: []; params?: {} }
    'businesses.store': { paramsTuple?: []; params?: {} }
    'businesses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.beneficiaries': { paramsTuple?: []; params?: {} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.store': { paramsTuple?: []; params?: {} }
    'transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.categories': { paramsTuple?: []; params?: {} }
    'stock_items.index': { paramsTuple?: []; params?: {} }
    'stock_items.store': { paramsTuple?: []; params?: {} }
    'stock_items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.index': { paramsTuple?: []; params?: {} }
    'stock_transactions.store': { paramsTuple?: []; params?: {} }
    'stock_transactions.bulk_move_rotation': { paramsTuple?: []; params?: {} }
    'stock_transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.index': { paramsTuple?: []; params?: {} }
    'customers.store': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.index': { paramsTuple?: []; params?: {} }
    'suppliers.store': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.index': { paramsTuple?: []; params?: {} }
    'sales.store': { paramsTuple?: []; params?: {} }
    'sales.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.add_payment': { paramsTuple?: []; params?: {} }
    'sales.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.index': { paramsTuple?: []; params?: {} }
    'rotations.store': { paramsTuple?: []; params?: {} }
    'rotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.close': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'business_users.users': { paramsTuple?: []; params?: {} }
    'business_users.index': { paramsTuple?: []; params?: {} }
    'business_users.store': { paramsTuple?: []; params?: {} }
    'business_users.create_user': { paramsTuple?: []; params?: {} }
    'business_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'business_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.sales_report': { paramsTuple?: []; params?: {} }
    'reports.transactions_report': { paramsTuple?: []; params?: {} }
    'reports.stock_report': { paramsTuple?: []; params?: {} }
    'profile.admin_update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'businesses.index': { paramsTuple?: []; params?: {} }
    'businesses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.beneficiaries': { paramsTuple?: []; params?: {} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.categories': { paramsTuple?: []; params?: {} }
    'stock_items.index': { paramsTuple?: []; params?: {} }
    'stock_items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.index': { paramsTuple?: []; params?: {} }
    'stock_transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.index': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.index': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.index': { paramsTuple?: []; params?: {} }
    'sales.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.index': { paramsTuple?: []; params?: {} }
    'rotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'business_users.users': { paramsTuple?: []; params?: {} }
    'business_users.index': { paramsTuple?: []; params?: {} }
    'reports.sales_report': { paramsTuple?: []; params?: {} }
    'reports.transactions_report': { paramsTuple?: []; params?: {} }
    'reports.stock_report': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'businesses.index': { paramsTuple?: []; params?: {} }
    'businesses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.beneficiaries': { paramsTuple?: []; params?: {} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.categories': { paramsTuple?: []; params?: {} }
    'stock_items.index': { paramsTuple?: []; params?: {} }
    'stock_items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.index': { paramsTuple?: []; params?: {} }
    'stock_transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.index': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.index': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.index': { paramsTuple?: []; params?: {} }
    'sales.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.index': { paramsTuple?: []; params?: {} }
    'rotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'business_users.users': { paramsTuple?: []; params?: {} }
    'business_users.index': { paramsTuple?: []; params?: {} }
    'reports.sales_report': { paramsTuple?: []; params?: {} }
    'reports.transactions_report': { paramsTuple?: []; params?: {} }
    'reports.stock_report': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.request_email_change': { paramsTuple?: []; params?: {} }
    'profile.profile.verify_email_change': { paramsTuple?: []; params?: {} }
    'businesses.store': { paramsTuple?: []; params?: {} }
    'transactions.store': { paramsTuple?: []; params?: {} }
    'stock_items.store': { paramsTuple?: []; params?: {} }
    'stock_transactions.store': { paramsTuple?: []; params?: {} }
    'stock_transactions.bulk_move_rotation': { paramsTuple?: []; params?: {} }
    'customers.store': { paramsTuple?: []; params?: {} }
    'suppliers.store': { paramsTuple?: []; params?: {} }
    'sales.store': { paramsTuple?: []; params?: {} }
    'sales.add_payment': { paramsTuple?: []; params?: {} }
    'rotations.store': { paramsTuple?: []; params?: {} }
    'rotations.close': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'business_users.store': { paramsTuple?: []; params?: {} }
    'business_users.create_user': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.profile.update_profile': { paramsTuple?: []; params?: {} }
    'profile.profile.update_password': { paramsTuple?: []; params?: {} }
    'businesses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.admin_update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'businesses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'business_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'business_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}