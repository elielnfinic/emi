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
    }
  }
  dashboard: {
    show: typeof routes['dashboard.show']
  }
  organizations: {
    index: typeof routes['organizations.index']
    store: typeof routes['organizations.store']
    show: typeof routes['organizations.show']
    update: typeof routes['organizations.update']
    destroy: typeof routes['organizations.destroy']
  }
  businesses: {
    index: typeof routes['businesses.index']
    store: typeof routes['businesses.store']
    show: typeof routes['businesses.show']
    update: typeof routes['businesses.update']
    destroy: typeof routes['businesses.destroy']
  }
  transactions: {
    index: typeof routes['transactions.index']
    store: typeof routes['transactions.store']
    show: typeof routes['transactions.show']
    update: typeof routes['transactions.update']
    destroy: typeof routes['transactions.destroy']
  }
  stockItems: {
    index: typeof routes['stock_items.index']
    store: typeof routes['stock_items.store']
    show: typeof routes['stock_items.show']
    update: typeof routes['stock_items.update']
    destroy: typeof routes['stock_items.destroy']
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
}
