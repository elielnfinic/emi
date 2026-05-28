/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
      updateProfile: typeof routes['profile.profile.update_profile']
      updatePassword: typeof routes['profile.profile.update_password']
      requestEmailChange: typeof routes['profile.profile.request_email_change']
      verifyEmailChange: typeof routes['profile.profile.verify_email_change']
    }
    adminUpdateUser: typeof routes['profile.admin_update_user']
  }
  dashboard: {
    show: typeof routes['dashboard.show']
  }
  businesses: {
    index: typeof routes['businesses.index']
    store: typeof routes['businesses.store']
    show: typeof routes['businesses.show']
    update: typeof routes['businesses.update']
    destroy: typeof routes['businesses.destroy']
  }
  transactions: {
    beneficiaries: typeof routes['transactions.beneficiaries']
    index: typeof routes['transactions.index']
    store: typeof routes['transactions.store']
    show: typeof routes['transactions.show']
    update: typeof routes['transactions.update']
    destroy: typeof routes['transactions.destroy']
  }
  stockItems: {
    categories: typeof routes['stock_items.categories']
    index: typeof routes['stock_items.index']
    store: typeof routes['stock_items.store']
    show: typeof routes['stock_items.show']
    update: typeof routes['stock_items.update']
    destroy: typeof routes['stock_items.destroy']
  }
  stockTransactions: {
    index: typeof routes['stock_transactions.index']
    store: typeof routes['stock_transactions.store']
    bulkMoveRotation: typeof routes['stock_transactions.bulk_move_rotation']
    show: typeof routes['stock_transactions.show']
    update: typeof routes['stock_transactions.update']
    destroy: typeof routes['stock_transactions.destroy']
  }
  customers: {
    index: typeof routes['customers.index']
    store: typeof routes['customers.store']
    show: typeof routes['customers.show']
    update: typeof routes['customers.update']
    destroy: typeof routes['customers.destroy']
  }
  suppliers: {
    index: typeof routes['suppliers.index']
    store: typeof routes['suppliers.store']
    show: typeof routes['suppliers.show']
    update: typeof routes['suppliers.update']
    destroy: typeof routes['suppliers.destroy']
  }
  sales: {
    index: typeof routes['sales.index']
    store: typeof routes['sales.store']
    show: typeof routes['sales.show']
    addPayment: typeof routes['sales.add_payment']
    destroy: typeof routes['sales.destroy']
  }
  rotations: {
    index: typeof routes['rotations.index']
    store: typeof routes['rotations.store']
    show: typeof routes['rotations.show']
    close: typeof routes['rotations.close']
    destroy: typeof routes['rotations.destroy']
  }
  roles: {
    index: typeof routes['roles.index']
  }
  businessUsers: {
    users: typeof routes['business_users.users']
    index: typeof routes['business_users.index']
    store: typeof routes['business_users.store']
    createUser: typeof routes['business_users.create_user']
    update: typeof routes['business_users.update']
    destroy: typeof routes['business_users.destroy']
  }
  reports: {
    salesReport: typeof routes['reports.sales_report']
    transactionsReport: typeof routes['reports.transactions_report']
    stockReport: typeof routes['reports.stock_report']
  }
}
