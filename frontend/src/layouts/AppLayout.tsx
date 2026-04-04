import { useEffect, useMemo } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore, useAppStore } from '../stores'
import { Icon } from '../components/ui/Icon'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import api from '../services/api'
import type { Business, Organization } from '../types'

export function AppLayout() {
  const { user, logout, setUser } = useAuthStore()
  const { currentBusiness, setCurrentBusiness, sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore()
  const navigate = useNavigate()

  const isSuperAdmin = user?.role === 'superadmin'

  useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/account/profile')
      const profile = res.data?.data ?? res.data
      setUser(profile)
      return profile
    },
    staleTime: 60_000,
  })

  const hasBusinessAccess = useMemo(() => {
    if (isSuperAdmin) return true
    return user?.businessRoles && Object.keys(user.businessRoles).length > 0
  }, [user, isSuperAdmin])

  const { data: orgs } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => (await api.get('/organizations')).data,
    enabled: !!hasBusinessAccess && !isSuperAdmin,
  })
  const orgId = orgs?.[0]?.id

  const { data: businesses } = useQuery<Business[]>({
    queryKey: ['businesses', isSuperAdmin ? 'all' : orgId],
    queryFn: async () =>
      isSuperAdmin
        ? (await api.get('/businesses')).data
        : (await api.get('/businesses', { params: { organization_id: orgId } })).data,
    enabled: isSuperAdmin ? true : !!orgId && !!hasBusinessAccess,
  })

  useEffect(() => {
    if (businesses?.length) {
      if (!currentBusiness || !businesses.find((b) => b.id === currentBusiness.id)) {
        setCurrentBusiness(businesses[0])
      }
    }
  }, [businesses, currentBusiness, setCurrentBusiness])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [setSidebarOpen])

  const handleLogout = () => { logout(); navigate('/login') }

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const biz = businesses?.find((b) => b.id === Number(e.target.value))
    if (biz) setCurrentBusiness(biz)
  }

  const currentRole = useMemo(() => {
    if (isSuperAdmin) return 'admin'
    if (!currentBusiness || !user?.businessRoles) return null
    return user.businessRoles[currentBusiness.id] || null
  }, [currentBusiness, user, isSuperAdmin])

  const isAnyAdmin = useMemo(() => {
    if (isSuperAdmin) return true
    if (!user?.businessRoles) return false
    return Object.values(user.businessRoles).some((role) => role === 'admin')
  }, [user, isSuperAdmin])

  const mainNav = useMemo(() => {
    const items = [
      { to: '/dashboard',   label: 'Dashboard',  icon: 'home',         roles: ['admin','manager','cashier','stock'] },
      { to: '/sales',       label: 'Ventes',      icon: 'sales',        roles: ['admin','manager','cashier'] },
      { to: '/stock',       label: 'Inventaire',  icon: 'stock',        roles: ['admin','manager','stock'] },
      { to: '/customers',   label: 'Clients',     icon: 'customers',    roles: ['admin','manager','cashier'] },
      { to: '/suppliers',   label: 'Fournisseurs',icon: 'suppliers',    roles: ['admin','manager'] },
    ]
    if (!currentRole) return []
    return items.filter((i) => i.roles.includes(currentRole))
  }, [currentRole])

  const financeNav = useMemo(() => {
    const items = [
      { to: '/transactions', label: 'Transactions', icon: 'arrow-up-down', roles: ['admin','manager'] },
      { to: '/unpaid-bills', label: 'Impayés',      icon: 'debt',          roles: ['admin','manager','cashier'] },
      { to: '/rotations',    label: 'Rotations',    icon: 'rotations',     roles: ['admin','manager'] },
      { to: '/reports',      label: 'Rapports',     icon: 'reports',       roles: ['admin','manager'] },
    ]
    if (!currentRole) return []
    return items.filter((i) => i.roles.includes(currentRole))
  }, [currentRole])

  const settingsNav = useMemo(() => {
    const items = isSuperAdmin
      ? [
          { to: '/organizations', label: 'Organisations', icon: 'businesses', roles: ['admin'] },
          { to: '/businesses',    label: 'Businesses',    icon: 'businesses', roles: ['admin'] },
          { to: '/users',         label: 'Équipe',        icon: 'users',      roles: ['admin'] },
        ]
      : [
          { to: '/businesses', label: 'Businesses', icon: 'businesses', roles: ['admin'] },
          { to: '/users',      label: 'Équipe',     icon: 'users',      roles: ['admin'] },
        ]
    if (!currentRole) return []
    return items.filter((i) => i.roles.includes(currentRole))
  }, [currentRole, isSuperAdmin])

  const renderNav = (items: typeof mainNav) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
            isActive
              ? 'bg-white/12 text-white shadow-sm'
              : 'text-zinc-400 hover:bg-white/6 hover:text-zinc-200'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`shrink-0 transition-colors ${isActive ? 'text-emi-violet' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
              <Icon name={item.icon} size={17} />
            </span>
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    ))

  if (!hasBusinessAccess) {
    return (
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/icon.png" alt="EMI" className="w-8 h-8 rounded-xl" />
              <span className="text-base font-bold tracking-tight text-emi-violet" style={{ fontFamily: "'Montserrat', sans-serif" }}>EMI</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30">
              <Icon name="logout" size={16} /><span>Déconnexion</span>
            </button>
          </header>
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 mb-5">
                <Icon name="alert" size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Accès restreint</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Vous n'êtes membre d'aucune organisation. Contactez votre administrateur pour être assigné à un business.
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#09090B] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed lg:static lg:translate-x-0 z-30
        w-[230px] shrink-0 h-full
        flex flex-col
        bg-[#0A0A0F] border-r border-white/[0.06]
        transition-transform duration-300 ease-out
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
          <img src="/icon.png" alt="EMI" className="w-8 h-8 rounded-xl" />
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>EMI</h1>
            <p className="text-[9px] font-medium uppercase tracking-widest text-zinc-600 leading-none mt-0.5">Opérations Réussies</p>
          </div>
        </div>

        {/* Business selector */}
        <div className="px-3 py-3 border-b border-white/[0.06]">
          {businesses?.length ? (
            <div className="relative">
              <select
                value={currentBusiness?.id || ''}
                onChange={handleBusinessChange}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs font-medium rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emi-violet/50 transition-colors cursor-pointer"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id} className="bg-zinc-900 text-zinc-100">{b.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Icon name="chevron-down" size={12} />
              </div>
            </div>
          ) : isAnyAdmin ? (
            <NavLink
              to="/businesses"
              className="flex items-center justify-center gap-2 text-xs text-emi-violet hover:text-violet-300 py-2.5 px-3 rounded-xl border border-dashed border-emi-violet/30 hover:border-emi-violet/50 transition-colors"
            >
              <Icon name="plus" size={13} /><span>Créer un business</span>
            </NavLink>
          ) : (
            <p className="text-xs text-zinc-600 text-center py-2">Aucun business disponible</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
          {mainNav.length > 0 && (
            <div className="space-y-0.5">{renderNav(mainNav)}</div>
          )}
          {financeNav.length > 0 && (
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Finance</p>
              <div className="space-y-0.5">{renderNav(financeNav)}</div>
            </div>
          )}
          {settingsNav.length > 0 && (
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Paramètres</p>
              <div className="space-y-0.5">{renderNav(settingsNav)}</div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
          <ThemeToggle />
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emi-violet to-emi-violet-dark text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {user?.initials || '??'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user?.fullName || user?.email}</p>
              <p className="text-[10px] text-zinc-600 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/6"
            >
              <Icon name="logout" size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Icon name="menu" size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="EMI" className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-bold text-emi-violet" style={{ fontFamily: "'Montserrat', sans-serif" }}>EMI</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-7 animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
