/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const OrganizationsController = () => import('#controllers/organizations_controller')
const BusinessesController = () => import('#controllers/businesses_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const StockItemsController = () => import('#controllers/stock_items_controller')
const CustomersController = () => import('#controllers/customers_controller')
const SuppliersController = () => import('#controllers/suppliers_controller')
const SalesController = () => import('#controllers/sales_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const RotationsController = () => import('#controllers/rotations_controller')
const BusinessUsersController = () => import('#controllers/business_users_controller')
const ReportsController = () => import('#controllers/reports_controller')

router.get('/', () => {
  return { hello: 'world', app: 'Emi', version: '1.0.0' }
})

router
  .group(() => {
    // Auth
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    // Profile
    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // Protected API routes
    router
      .group(() => {
        // Dashboard
        router.get('dashboard', [DashboardController, 'show'])

        // Organizations CRUD
        router.get('organizations', [OrganizationsController, 'index'])
        router.post('organizations', [OrganizationsController, 'store'])
        router.get('organizations/:id', [OrganizationsController, 'show'])
        router.put('organizations/:id', [OrganizationsController, 'update'])
        router.delete('organizations/:id', [OrganizationsController, 'destroy'])

        // Businesses CRUD
        router.get('businesses', [BusinessesController, 'index'])
        router.post('businesses', [BusinessesController, 'store'])
        router.get('businesses/:id', [BusinessesController, 'show'])
        router.put('businesses/:id', [BusinessesController, 'update'])
        router.delete('businesses/:id', [BusinessesController, 'destroy'])

        // Transactions CRUD
        router.get('transactions', [TransactionsController, 'index'])
        router.post('transactions', [TransactionsController, 'store'])
        router.get('transactions/:id', [TransactionsController, 'show'])
        router.put('transactions/:id', [TransactionsController, 'update'])
        router.delete('transactions/:id', [TransactionsController, 'destroy'])

        // Stock Items CRUD
        router.get('stock-items', [StockItemsController, 'index'])
        router.post('stock-items', [StockItemsController, 'store'])
        router.get('stock-items/:id', [StockItemsController, 'show'])
        router.put('stock-items/:id', [StockItemsController, 'update'])
        router.delete('stock-items/:id', [StockItemsController, 'destroy'])

        // Customers CRUD
        router.get('customers', [CustomersController, 'index'])
        router.post('customers', [CustomersController, 'store'])
        router.get('customers/:id', [CustomersController, 'show'])
        router.put('customers/:id', [CustomersController, 'update'])
        router.delete('customers/:id', [CustomersController, 'destroy'])

        // Suppliers CRUD
        router.get('suppliers', [SuppliersController, 'index'])
        router.post('suppliers', [SuppliersController, 'store'])
        router.get('suppliers/:id', [SuppliersController, 'show'])
        router.put('suppliers/:id', [SuppliersController, 'update'])
        router.delete('suppliers/:id', [SuppliersController, 'destroy'])

        // Sales CRUD
        router.get('sales', [SalesController, 'index'])
        router.post('sales', [SalesController, 'store'])
        router.get('sales/:id', [SalesController, 'show'])
        router.post('sales/payments', [SalesController, 'addPayment'])
        router.delete('sales/:id', [SalesController, 'destroy'])

        // Rotations CRUD
        router.get('rotations', [RotationsController, 'index'])
        router.post('rotations', [RotationsController, 'store'])
        router.get('rotations/:id', [RotationsController, 'show'])
        router.post('rotations/:id/close', [RotationsController, 'close'])
        router.delete('rotations/:id', [RotationsController, 'destroy'])

        // Business Users
        router.get('business-users/users', [BusinessUsersController, 'users'])
        router.get('business-users', [BusinessUsersController, 'index'])
        router.post('business-users', [BusinessUsersController, 'store'])
        router.post('business-users/create-user', [BusinessUsersController, 'createUser'])
        router.delete('business-users/:id', [BusinessUsersController, 'destroy'])

        // Reports
        router.get('reports/sales', [ReportsController, 'salesReport'])
        router.get('reports/transactions', [ReportsController, 'transactionsReport'])
        router.get('reports/stock', [ReportsController, 'stockReport'])
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
