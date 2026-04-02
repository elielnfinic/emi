import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore, useAppStore } from '../stores'
import { Icon } from '../components/ui/Icon'
import api from '../services/api'
import type { Business, Organization } from '../types'

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const { currentBusiness, setCurrentBusiness, sidebarOpen, toggleSidebar } = useAppStore()
  const navigate = useNavigate()

  const { data: orgs } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => (await api.get('/organizations')).data,
  })

  const orgId = orgs?.[0]?.id

  const { data: businesses } = useQuery<Business[]>({
    queryKey: ['businesses', orgId],
    queryFn: async () => (await api.get('/businesses', { params: { organization_id: orgId } })).data,
    enabled: !!orgId,
  })

  useEffect(() => {
    if (businesses?.length) {
      if (!currentBusiness || !businesses.find((b) => b.id === currentBusiness.id)) {
        setCurrentBusiness(businesses[0])
      }
    }
  }, [businesses, currentBusiness, setCurrentBusiness])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const biz = businesses?.find((b) => b.id === Number(e.target.value))
    if (biz) setCurrentBusiness(biz)
  }

  const mainNav = [
    { to: '/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/sales', label: 'Sales', icon: 'sales' },
    { to: '/stock', label: 'Inventory', icon: 'stock' },
    { to: '/customers', label: 'Customers', icon: 'customers' },
    { to: '/suppliers', label: 'Suppliers', icon: 'suppliers' },
  ]

  const financeNav = [
    { to: '/transactions', label: 'Transactions', icon: 'arrow-up-down' },
    { to: '/rotations', label: 'Rotations', icon: 'rotations' },
    { to: '/reports', label: 'Reports', icon: 'reports' },
  ]

  const settingsNav = [
    { to: '/businesses', label: 'Businesses', icon: 'businesses' },
    { to: '/users', label: 'Team', icon: 'users' },
  ]

  const renderNavItems = (items: typeof mainNav) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-emi-violet/10 text-emi-violet shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`
        }
      >
        <Icon name={item.icon} size={18} />
        <span>{item.label}</span>
      </NavLink>
    ))

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 transition-transform duration-300 bg-white border-r border-gray-200 flex flex-col h-full`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="EMI" className="w-9 h-9 rounded-lg" />
            <div>
              <h1 className="text-lg font-extrabold tracking-wide text-emi-violet" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                EMI
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Opérations Réussies
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 border-b border-gray-100">
          {businesses?.length ? (
            <div className="relative">
              <select
                value={currentBusiness?.id || ''}
                onChange={handleBusinessChange}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet transition-colors"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Icon name="chevron-down" size={14} />
              </div>
            </div>
          ) : (
            <NavLink to="/businesses" className="flex items-center justify-center gap-2 text-sm text-emi-violet hover:text-emi-violet-dark py-2 px-3 rounded-lg border border-dashed border-emi-violet/30 hover:border-emi-violet/50 transition-colors">
              <Icon name="plus" size={16} />
              <span>Create a business</span>
            </NavLink>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          <div className="space-y-0.5">
            {renderNavItems(mainNav)}
          </div>

          <div>
            <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
            <div className="space-y-0.5">
              {renderNavItems(financeNav)}
            </div>
          </div>

          <div>
            <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
            <div className="space-y-0.5">
              {renderNavItems(settingsNav)}
            </div>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emi-violet to-emi-green text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.initials || '??'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || user?.email}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600 transition-colors lg:hidden">
            <Icon name="menu" size={24} />
          </button>
          <div className="hidden lg:block" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Icon name="logout" size={16} />
            <span>Sign out</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
