/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_token.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_token.store']['types'],
  },
  'auth.access_token.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.access_token.destroy']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.profile.update_profile': {
    methods: ["PUT"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.update_profile']['types'],
  },
  'profile.profile.update_password': {
    methods: ["PUT"],
    pattern: '/api/v1/account/password',
    tokens: [{"old":"/api/v1/account/password","type":0,"val":"api","end":""},{"old":"/api/v1/account/password","type":0,"val":"v1","end":""},{"old":"/api/v1/account/password","type":0,"val":"account","end":""},{"old":"/api/v1/account/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['profile.profile.update_password']['types'],
  },
  'profile.profile.request_email_change': {
    methods: ["POST"],
    pattern: '/api/v1/account/email/request',
    tokens: [{"old":"/api/v1/account/email/request","type":0,"val":"api","end":""},{"old":"/api/v1/account/email/request","type":0,"val":"v1","end":""},{"old":"/api/v1/account/email/request","type":0,"val":"account","end":""},{"old":"/api/v1/account/email/request","type":0,"val":"email","end":""},{"old":"/api/v1/account/email/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['profile.profile.request_email_change']['types'],
  },
  'profile.profile.verify_email_change': {
    methods: ["POST"],
    pattern: '/api/v1/account/email/verify',
    tokens: [{"old":"/api/v1/account/email/verify","type":0,"val":"api","end":""},{"old":"/api/v1/account/email/verify","type":0,"val":"v1","end":""},{"old":"/api/v1/account/email/verify","type":0,"val":"account","end":""},{"old":"/api/v1/account/email/verify","type":0,"val":"email","end":""},{"old":"/api/v1/account/email/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['profile.profile.verify_email_change']['types'],
  },
  'dashboard.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dashboard',
    tokens: [{"old":"/api/v1/dashboard","type":0,"val":"api","end":""},{"old":"/api/v1/dashboard","type":0,"val":"v1","end":""},{"old":"/api/v1/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard.show']['types'],
  },
  'businesses.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/businesses',
    tokens: [{"old":"/api/v1/businesses","type":0,"val":"api","end":""},{"old":"/api/v1/businesses","type":0,"val":"v1","end":""},{"old":"/api/v1/businesses","type":0,"val":"businesses","end":""}],
    types: placeholder as Registry['businesses.index']['types'],
  },
  'businesses.store': {
    methods: ["POST"],
    pattern: '/api/v1/businesses',
    tokens: [{"old":"/api/v1/businesses","type":0,"val":"api","end":""},{"old":"/api/v1/businesses","type":0,"val":"v1","end":""},{"old":"/api/v1/businesses","type":0,"val":"businesses","end":""}],
    types: placeholder as Registry['businesses.store']['types'],
  },
  'businesses.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/businesses/:id',
    tokens: [{"old":"/api/v1/businesses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/businesses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/businesses/:id","type":0,"val":"businesses","end":""},{"old":"/api/v1/businesses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['businesses.show']['types'],
  },
  'businesses.update': {
    methods: ["PUT"],
    pattern: '/api/v1/businesses/:id',
    tokens: [{"old":"/api/v1/businesses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/businesses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/businesses/:id","type":0,"val":"businesses","end":""},{"old":"/api/v1/businesses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['businesses.update']['types'],
  },
  'businesses.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/businesses/:id',
    tokens: [{"old":"/api/v1/businesses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/businesses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/businesses/:id","type":0,"val":"businesses","end":""},{"old":"/api/v1/businesses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['businesses.destroy']['types'],
  },
  'transactions.beneficiaries': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/transactions/beneficiaries',
    tokens: [{"old":"/api/v1/transactions/beneficiaries","type":0,"val":"api","end":""},{"old":"/api/v1/transactions/beneficiaries","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions/beneficiaries","type":0,"val":"transactions","end":""},{"old":"/api/v1/transactions/beneficiaries","type":0,"val":"beneficiaries","end":""}],
    types: placeholder as Registry['transactions.beneficiaries']['types'],
  },
  'transactions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/transactions',
    tokens: [{"old":"/api/v1/transactions","type":0,"val":"api","end":""},{"old":"/api/v1/transactions","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions","type":0,"val":"transactions","end":""}],
    types: placeholder as Registry['transactions.index']['types'],
  },
  'transactions.store': {
    methods: ["POST"],
    pattern: '/api/v1/transactions',
    tokens: [{"old":"/api/v1/transactions","type":0,"val":"api","end":""},{"old":"/api/v1/transactions","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions","type":0,"val":"transactions","end":""}],
    types: placeholder as Registry['transactions.store']['types'],
  },
  'transactions.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/transactions/:id',
    tokens: [{"old":"/api/v1/transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"transactions","end":""},{"old":"/api/v1/transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['transactions.show']['types'],
  },
  'transactions.update': {
    methods: ["PUT"],
    pattern: '/api/v1/transactions/:id',
    tokens: [{"old":"/api/v1/transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"transactions","end":""},{"old":"/api/v1/transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['transactions.update']['types'],
  },
  'transactions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/transactions/:id',
    tokens: [{"old":"/api/v1/transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"transactions","end":""},{"old":"/api/v1/transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['transactions.destroy']['types'],
  },
  'stock_items.categories': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/stock-items/categories',
    tokens: [{"old":"/api/v1/stock-items/categories","type":0,"val":"api","end":""},{"old":"/api/v1/stock-items/categories","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-items/categories","type":0,"val":"stock-items","end":""},{"old":"/api/v1/stock-items/categories","type":0,"val":"categories","end":""}],
    types: placeholder as Registry['stock_items.categories']['types'],
  },
  'stock_items.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/stock-items',
    tokens: [{"old":"/api/v1/stock-items","type":0,"val":"api","end":""},{"old":"/api/v1/stock-items","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-items","type":0,"val":"stock-items","end":""}],
    types: placeholder as Registry['stock_items.index']['types'],
  },
  'stock_items.store': {
    methods: ["POST"],
    pattern: '/api/v1/stock-items',
    tokens: [{"old":"/api/v1/stock-items","type":0,"val":"api","end":""},{"old":"/api/v1/stock-items","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-items","type":0,"val":"stock-items","end":""}],
    types: placeholder as Registry['stock_items.store']['types'],
  },
  'stock_items.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/stock-items/:id',
    tokens: [{"old":"/api/v1/stock-items/:id","type":0,"val":"api","end":""},{"old":"/api/v1/stock-items/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-items/:id","type":0,"val":"stock-items","end":""},{"old":"/api/v1/stock-items/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stock_items.show']['types'],
  },
  'stock_items.update': {
    methods: ["PUT"],
    pattern: '/api/v1/stock-items/:id',
    tokens: [{"old":"/api/v1/stock-items/:id","type":0,"val":"api","end":""},{"old":"/api/v1/stock-items/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-items/:id","type":0,"val":"stock-items","end":""},{"old":"/api/v1/stock-items/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stock_items.update']['types'],
  },
  'stock_items.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/stock-items/:id',
    tokens: [{"old":"/api/v1/stock-items/:id","type":0,"val":"api","end":""},{"old":"/api/v1/stock-items/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-items/:id","type":0,"val":"stock-items","end":""},{"old":"/api/v1/stock-items/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stock_items.destroy']['types'],
  },
  'stock_transactions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/stock-transactions',
    tokens: [{"old":"/api/v1/stock-transactions","type":0,"val":"api","end":""},{"old":"/api/v1/stock-transactions","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-transactions","type":0,"val":"stock-transactions","end":""}],
    types: placeholder as Registry['stock_transactions.index']['types'],
  },
  'stock_transactions.store': {
    methods: ["POST"],
    pattern: '/api/v1/stock-transactions',
    tokens: [{"old":"/api/v1/stock-transactions","type":0,"val":"api","end":""},{"old":"/api/v1/stock-transactions","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-transactions","type":0,"val":"stock-transactions","end":""}],
    types: placeholder as Registry['stock_transactions.store']['types'],
  },
  'stock_transactions.bulk_move_rotation': {
    methods: ["POST"],
    pattern: '/api/v1/stock-transactions/bulk-move-rotation',
    tokens: [{"old":"/api/v1/stock-transactions/bulk-move-rotation","type":0,"val":"api","end":""},{"old":"/api/v1/stock-transactions/bulk-move-rotation","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-transactions/bulk-move-rotation","type":0,"val":"stock-transactions","end":""},{"old":"/api/v1/stock-transactions/bulk-move-rotation","type":0,"val":"bulk-move-rotation","end":""}],
    types: placeholder as Registry['stock_transactions.bulk_move_rotation']['types'],
  },
  'stock_transactions.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/stock-transactions/:id',
    tokens: [{"old":"/api/v1/stock-transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/stock-transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-transactions/:id","type":0,"val":"stock-transactions","end":""},{"old":"/api/v1/stock-transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stock_transactions.show']['types'],
  },
  'stock_transactions.update': {
    methods: ["PUT"],
    pattern: '/api/v1/stock-transactions/:id',
    tokens: [{"old":"/api/v1/stock-transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/stock-transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-transactions/:id","type":0,"val":"stock-transactions","end":""},{"old":"/api/v1/stock-transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stock_transactions.update']['types'],
  },
  'stock_transactions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/stock-transactions/:id',
    tokens: [{"old":"/api/v1/stock-transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/stock-transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/stock-transactions/:id","type":0,"val":"stock-transactions","end":""},{"old":"/api/v1/stock-transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stock_transactions.destroy']['types'],
  },
  'customers.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/customers',
    tokens: [{"old":"/api/v1/customers","type":0,"val":"api","end":""},{"old":"/api/v1/customers","type":0,"val":"v1","end":""},{"old":"/api/v1/customers","type":0,"val":"customers","end":""}],
    types: placeholder as Registry['customers.index']['types'],
  },
  'customers.store': {
    methods: ["POST"],
    pattern: '/api/v1/customers',
    tokens: [{"old":"/api/v1/customers","type":0,"val":"api","end":""},{"old":"/api/v1/customers","type":0,"val":"v1","end":""},{"old":"/api/v1/customers","type":0,"val":"customers","end":""}],
    types: placeholder as Registry['customers.store']['types'],
  },
  'customers.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/customers/:id',
    tokens: [{"old":"/api/v1/customers/:id","type":0,"val":"api","end":""},{"old":"/api/v1/customers/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/customers/:id","type":0,"val":"customers","end":""},{"old":"/api/v1/customers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['customers.show']['types'],
  },
  'customers.update': {
    methods: ["PUT"],
    pattern: '/api/v1/customers/:id',
    tokens: [{"old":"/api/v1/customers/:id","type":0,"val":"api","end":""},{"old":"/api/v1/customers/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/customers/:id","type":0,"val":"customers","end":""},{"old":"/api/v1/customers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['customers.update']['types'],
  },
  'customers.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/customers/:id',
    tokens: [{"old":"/api/v1/customers/:id","type":0,"val":"api","end":""},{"old":"/api/v1/customers/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/customers/:id","type":0,"val":"customers","end":""},{"old":"/api/v1/customers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['customers.destroy']['types'],
  },
  'suppliers.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/suppliers',
    tokens: [{"old":"/api/v1/suppliers","type":0,"val":"api","end":""},{"old":"/api/v1/suppliers","type":0,"val":"v1","end":""},{"old":"/api/v1/suppliers","type":0,"val":"suppliers","end":""}],
    types: placeholder as Registry['suppliers.index']['types'],
  },
  'suppliers.store': {
    methods: ["POST"],
    pattern: '/api/v1/suppliers',
    tokens: [{"old":"/api/v1/suppliers","type":0,"val":"api","end":""},{"old":"/api/v1/suppliers","type":0,"val":"v1","end":""},{"old":"/api/v1/suppliers","type":0,"val":"suppliers","end":""}],
    types: placeholder as Registry['suppliers.store']['types'],
  },
  'suppliers.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/suppliers/:id',
    tokens: [{"old":"/api/v1/suppliers/:id","type":0,"val":"api","end":""},{"old":"/api/v1/suppliers/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/suppliers/:id","type":0,"val":"suppliers","end":""},{"old":"/api/v1/suppliers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['suppliers.show']['types'],
  },
  'suppliers.update': {
    methods: ["PUT"],
    pattern: '/api/v1/suppliers/:id',
    tokens: [{"old":"/api/v1/suppliers/:id","type":0,"val":"api","end":""},{"old":"/api/v1/suppliers/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/suppliers/:id","type":0,"val":"suppliers","end":""},{"old":"/api/v1/suppliers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['suppliers.update']['types'],
  },
  'suppliers.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/suppliers/:id',
    tokens: [{"old":"/api/v1/suppliers/:id","type":0,"val":"api","end":""},{"old":"/api/v1/suppliers/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/suppliers/:id","type":0,"val":"suppliers","end":""},{"old":"/api/v1/suppliers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['suppliers.destroy']['types'],
  },
  'sales.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/sales',
    tokens: [{"old":"/api/v1/sales","type":0,"val":"api","end":""},{"old":"/api/v1/sales","type":0,"val":"v1","end":""},{"old":"/api/v1/sales","type":0,"val":"sales","end":""}],
    types: placeholder as Registry['sales.index']['types'],
  },
  'sales.store': {
    methods: ["POST"],
    pattern: '/api/v1/sales',
    tokens: [{"old":"/api/v1/sales","type":0,"val":"api","end":""},{"old":"/api/v1/sales","type":0,"val":"v1","end":""},{"old":"/api/v1/sales","type":0,"val":"sales","end":""}],
    types: placeholder as Registry['sales.store']['types'],
  },
  'sales.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/sales/:id',
    tokens: [{"old":"/api/v1/sales/:id","type":0,"val":"api","end":""},{"old":"/api/v1/sales/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/sales/:id","type":0,"val":"sales","end":""},{"old":"/api/v1/sales/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sales.show']['types'],
  },
  'sales.add_payment': {
    methods: ["POST"],
    pattern: '/api/v1/sales/payments',
    tokens: [{"old":"/api/v1/sales/payments","type":0,"val":"api","end":""},{"old":"/api/v1/sales/payments","type":0,"val":"v1","end":""},{"old":"/api/v1/sales/payments","type":0,"val":"sales","end":""},{"old":"/api/v1/sales/payments","type":0,"val":"payments","end":""}],
    types: placeholder as Registry['sales.add_payment']['types'],
  },
  'sales.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/sales/:id',
    tokens: [{"old":"/api/v1/sales/:id","type":0,"val":"api","end":""},{"old":"/api/v1/sales/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/sales/:id","type":0,"val":"sales","end":""},{"old":"/api/v1/sales/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sales.destroy']['types'],
  },
  'rotations.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/rotations',
    tokens: [{"old":"/api/v1/rotations","type":0,"val":"api","end":""},{"old":"/api/v1/rotations","type":0,"val":"v1","end":""},{"old":"/api/v1/rotations","type":0,"val":"rotations","end":""}],
    types: placeholder as Registry['rotations.index']['types'],
  },
  'rotations.store': {
    methods: ["POST"],
    pattern: '/api/v1/rotations',
    tokens: [{"old":"/api/v1/rotations","type":0,"val":"api","end":""},{"old":"/api/v1/rotations","type":0,"val":"v1","end":""},{"old":"/api/v1/rotations","type":0,"val":"rotations","end":""}],
    types: placeholder as Registry['rotations.store']['types'],
  },
  'rotations.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/rotations/:id',
    tokens: [{"old":"/api/v1/rotations/:id","type":0,"val":"api","end":""},{"old":"/api/v1/rotations/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/rotations/:id","type":0,"val":"rotations","end":""},{"old":"/api/v1/rotations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['rotations.show']['types'],
  },
  'rotations.close': {
    methods: ["POST"],
    pattern: '/api/v1/rotations/:id/close',
    tokens: [{"old":"/api/v1/rotations/:id/close","type":0,"val":"api","end":""},{"old":"/api/v1/rotations/:id/close","type":0,"val":"v1","end":""},{"old":"/api/v1/rotations/:id/close","type":0,"val":"rotations","end":""},{"old":"/api/v1/rotations/:id/close","type":1,"val":"id","end":""},{"old":"/api/v1/rotations/:id/close","type":0,"val":"close","end":""}],
    types: placeholder as Registry['rotations.close']['types'],
  },
  'rotations.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/rotations/:id',
    tokens: [{"old":"/api/v1/rotations/:id","type":0,"val":"api","end":""},{"old":"/api/v1/rotations/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/rotations/:id","type":0,"val":"rotations","end":""},{"old":"/api/v1/rotations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['rotations.destroy']['types'],
  },
  'roles.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/roles',
    tokens: [{"old":"/api/v1/roles","type":0,"val":"api","end":""},{"old":"/api/v1/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['roles.index']['types'],
  },
  'business_users.users': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/business-users/users',
    tokens: [{"old":"/api/v1/business-users/users","type":0,"val":"api","end":""},{"old":"/api/v1/business-users/users","type":0,"val":"v1","end":""},{"old":"/api/v1/business-users/users","type":0,"val":"business-users","end":""},{"old":"/api/v1/business-users/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['business_users.users']['types'],
  },
  'business_users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/business-users',
    tokens: [{"old":"/api/v1/business-users","type":0,"val":"api","end":""},{"old":"/api/v1/business-users","type":0,"val":"v1","end":""},{"old":"/api/v1/business-users","type":0,"val":"business-users","end":""}],
    types: placeholder as Registry['business_users.index']['types'],
  },
  'business_users.store': {
    methods: ["POST"],
    pattern: '/api/v1/business-users',
    tokens: [{"old":"/api/v1/business-users","type":0,"val":"api","end":""},{"old":"/api/v1/business-users","type":0,"val":"v1","end":""},{"old":"/api/v1/business-users","type":0,"val":"business-users","end":""}],
    types: placeholder as Registry['business_users.store']['types'],
  },
  'business_users.create_user': {
    methods: ["POST"],
    pattern: '/api/v1/business-users/create-user',
    tokens: [{"old":"/api/v1/business-users/create-user","type":0,"val":"api","end":""},{"old":"/api/v1/business-users/create-user","type":0,"val":"v1","end":""},{"old":"/api/v1/business-users/create-user","type":0,"val":"business-users","end":""},{"old":"/api/v1/business-users/create-user","type":0,"val":"create-user","end":""}],
    types: placeholder as Registry['business_users.create_user']['types'],
  },
  'business_users.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/business-users/:id',
    tokens: [{"old":"/api/v1/business-users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/business-users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/business-users/:id","type":0,"val":"business-users","end":""},{"old":"/api/v1/business-users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['business_users.update']['types'],
  },
  'business_users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/business-users/:id',
    tokens: [{"old":"/api/v1/business-users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/business-users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/business-users/:id","type":0,"val":"business-users","end":""},{"old":"/api/v1/business-users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['business_users.destroy']['types'],
  },
  'reports.sales_report': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/reports/sales',
    tokens: [{"old":"/api/v1/reports/sales","type":0,"val":"api","end":""},{"old":"/api/v1/reports/sales","type":0,"val":"v1","end":""},{"old":"/api/v1/reports/sales","type":0,"val":"reports","end":""},{"old":"/api/v1/reports/sales","type":0,"val":"sales","end":""}],
    types: placeholder as Registry['reports.sales_report']['types'],
  },
  'reports.transactions_report': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/reports/transactions',
    tokens: [{"old":"/api/v1/reports/transactions","type":0,"val":"api","end":""},{"old":"/api/v1/reports/transactions","type":0,"val":"v1","end":""},{"old":"/api/v1/reports/transactions","type":0,"val":"reports","end":""},{"old":"/api/v1/reports/transactions","type":0,"val":"transactions","end":""}],
    types: placeholder as Registry['reports.transactions_report']['types'],
  },
  'reports.stock_report': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/reports/stock',
    tokens: [{"old":"/api/v1/reports/stock","type":0,"val":"api","end":""},{"old":"/api/v1/reports/stock","type":0,"val":"v1","end":""},{"old":"/api/v1/reports/stock","type":0,"val":"reports","end":""},{"old":"/api/v1/reports/stock","type":0,"val":"stock","end":""}],
    types: placeholder as Registry['reports.stock_report']['types'],
  },
  'profile.admin_update_user': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['profile.admin_update_user']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
