/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'dashboard.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['show']>>>
    }
  }
  'organizations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/organizations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['index']>>>
    }
  }
  'organizations.store': {
    methods: ["POST"]
    pattern: '/api/v1/organizations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization').createOrganizationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/organization').createOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'organizations.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['show']>>>
    }
  }
  'organizations.update': {
    methods: ["PUT"]
    pattern: '/api/v1/organizations/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization').updateOrganizationValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/organization').updateOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'organizations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['destroy']>>>
    }
  }
  'businesses.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/businesses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['index']>>>
    }
  }
  'businesses.store': {
    methods: ["POST"]
    pattern: '/api/v1/businesses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/business').createBusinessValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/business').createBusinessValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'businesses.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/businesses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['show']>>>
    }
  }
  'businesses.update': {
    methods: ["PUT"]
    pattern: '/api/v1/businesses/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/business').updateBusinessValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/business').updateBusinessValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'businesses.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/businesses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/businesses_controller').default['destroy']>>>
    }
  }
  'transactions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/transactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['index']>>>
    }
  }
  'transactions.store': {
    methods: ["POST"]
    pattern: '/api/v1/transactions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/transaction').createTransactionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/transaction').createTransactionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transactions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/transactions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['show']>>>
    }
  }
  'transactions.update': {
    methods: ["PUT"]
    pattern: '/api/v1/transactions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/transaction').updateTransactionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/transaction').updateTransactionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transactions.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/transactions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/transactions_controller').default['destroy']>>>
    }
  }
  'stock_items.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/stock-items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['index']>>>
    }
  }
  'stock_items.store': {
    methods: ["POST"]
    pattern: '/api/v1/stock-items'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock_item').createStockItemValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/stock_item').createStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'stock_items.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/stock-items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['show']>>>
    }
  }
  'stock_items.update': {
    methods: ["PUT"]
    pattern: '/api/v1/stock-items/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stock_item').updateStockItemValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stock_item').updateStockItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'stock_items.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/stock-items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stock_items_controller').default['destroy']>>>
    }
  }
  'customers.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/customers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['index']>>>
    }
  }
  'customers.store': {
    methods: ["POST"]
    pattern: '/api/v1/customers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/customer').createCustomerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/customer').createCustomerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'customers.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/customers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['show']>>>
    }
  }
  'customers.update': {
    methods: ["PUT"]
    pattern: '/api/v1/customers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/customer').updateCustomerValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/customer').updateCustomerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'customers.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/customers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['destroy']>>>
    }
  }
  'suppliers.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/suppliers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['index']>>>
    }
  }
  'suppliers.store': {
    methods: ["POST"]
    pattern: '/api/v1/suppliers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/supplier').createSupplierValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/supplier').createSupplierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'suppliers.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/suppliers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['show']>>>
    }
  }
  'suppliers.update': {
    methods: ["PUT"]
    pattern: '/api/v1/suppliers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/supplier').updateSupplierValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/supplier').updateSupplierValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'suppliers.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/suppliers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['destroy']>>>
    }
  }
  'sales.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/sales'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['index']>>>
    }
  }
  'sales.store': {
    methods: ["POST"]
    pattern: '/api/v1/sales'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/sale').createSaleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/sale').createSaleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'sales.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/sales/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['show']>>>
    }
  }
  'sales.add_payment': {
    methods: ["POST"]
    pattern: '/api/v1/sales/payments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/sale').createSalePaymentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/sale').createSalePaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['addPayment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['addPayment']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'sales.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/sales/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sales_controller').default['destroy']>>>
    }
  }
  'rotations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/rotations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['index']>>>
    }
  }
  'rotations.store': {
    methods: ["POST"]
    pattern: '/api/v1/rotations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['store']>>>
    }
  }
  'rotations.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/rotations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['show']>>>
    }
  }
  'rotations.close': {
    methods: ["POST"]
    pattern: '/api/v1/rotations/:id/close'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['close']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['close']>>>
    }
  }
  'rotations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/rotations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rotations_controller').default['destroy']>>>
    }
  }
  'business_users.users': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/business-users/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['users']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['users']>>>
    }
  }
  'business_users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/business-users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['index']>>>
    }
  }
  'business_users.store': {
    methods: ["POST"]
    pattern: '/api/v1/business-users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['store']>>>
    }
  }
  'business_users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/business-users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/business_users_controller').default['destroy']>>>
    }
  }
  'reports.sales_report': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/reports/sales'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['salesReport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['salesReport']>>>
    }
  }
  'reports.transactions_report': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/reports/transactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['transactionsReport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['transactionsReport']>>>
    }
  }
  'reports.stock_report': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/reports/stock'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['stockReport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['stockReport']>>>
    }
  }
}
