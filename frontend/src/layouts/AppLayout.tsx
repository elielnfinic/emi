import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore, useAppStore } from '../stores'
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

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/transactions', label: 'Transactions', icon: '💰' },
    { to: '/sales', label: 'Sales', icon: '🛒' },
    { to: '/stock', label: 'Stock', icon: '📦' },
    { to: '/customers', label: 'Customers', icon: '👥' },
    { to: '/suppliers', label: 'Suppliers', icon: '🏭' },
  ]

  const managementItems = [
    { to: '/businesses', label: 'Businesses', icon: '🏢' },
    { to: '/organizations', label: 'Organizations', icon: '🏛️' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 transition-transform duration-300 bg-white border-r border-gray-200 flex flex-col h-full`}>
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-violet-600">EMI</h1>
          <p className="text-xs text-gray-400 mt-0.5">Opérations Réussies</p>
        </div>

        <div className="px-4 py-3 border-b border-gray-200">
          {businesses?.length ? (
            <select
              value={currentBusiness?.id || ''}
              onChange={handleBusinessChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : (
            <NavLink to="/businesses" className="block text-center text-sm text-violet-600 hover:text-violet-700 py-2">
              + Create a business
            </NavLink>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-4 pb-1 px-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Management</p>
          </div>
          {managementItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              {user?.initials || '??'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || user?.email}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-sm">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600 transition-colors lg:hidden">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden lg:block" />
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
