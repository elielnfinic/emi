import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../stores'

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/transactions', label: 'Transactions', icon: '💰' },
    { to: '/sales', label: 'Sales', icon: '🛒' },
    { to: '/stock', label: 'Stock', icon: '📦' },
    { to: '/customers', label: 'Customers', icon: '👥' },
    { to: '/suppliers', label: 'Suppliers', icon: '🏭' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-violet-600">EMI</h1>
          <p className="text-xs text-gray-500 mt-1">Opérations Réussies</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-medium">
              {user?.initials || '??'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
