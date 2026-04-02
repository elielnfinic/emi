import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.index': { paramsTuple?: []; params?: {} }
    'businesses.store': { paramsTuple?: []; params?: {} }
    'businesses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.store': { paramsTuple?: []; params?: {} }
    'transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.index': { paramsTuple?: []; params?: {} }
    'stock_items.store': { paramsTuple?: []; params?: {} }
    'stock_items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'business_users.users': { paramsTuple?: []; params?: {} }
    'business_users.index': { paramsTuple?: []; params?: {} }
    'business_users.store': { paramsTuple?: []; params?: {} }
    'business_users.create_user': { paramsTuple?: []; params?: {} }
    'business_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.sales_report': { paramsTuple?: []; params?: {} }
    'reports.transactions_report': { paramsTuple?: []; params?: {} }
    'reports.stock_report': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.index': { paramsTuple?: []; params?: {} }
    'businesses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.index': { paramsTuple?: []; params?: {} }
    'stock_items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.index': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.index': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.index': { paramsTuple?: []; params?: {} }
    'sales.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.index': { paramsTuple?: []; params?: {} }
    'rotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'business_users.users': { paramsTuple?: []; params?: {} }
    'business_users.index': { paramsTuple?: []; params?: {} }
    'reports.sales_report': { paramsTuple?: []; params?: {} }
    'reports.transactions_report': { paramsTuple?: []; params?: {} }
    'reports.stock_report': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.show': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.index': { paramsTuple?: []; params?: {} }
    'businesses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.index': { paramsTuple?: []; params?: {} }
    'transactions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.index': { paramsTuple?: []; params?: {} }
    'stock_items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.index': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.index': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.index': { paramsTuple?: []; params?: {} }
    'sales.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.index': { paramsTuple?: []; params?: {} }
    'rotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'organizations.store': { paramsTuple?: []; params?: {} }
    'businesses.store': { paramsTuple?: []; params?: {} }
    'transactions.store': { paramsTuple?: []; params?: {} }
    'stock_items.store': { paramsTuple?: []; params?: {} }
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
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'businesses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'transactions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stock_items.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sales.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rotations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'business_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}