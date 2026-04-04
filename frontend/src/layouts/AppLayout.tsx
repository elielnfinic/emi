import { useEffect, useMemo, useState, useRef } from 'react'
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

  const [showBizMenu, setShowBizMenu] = useState(false)
  const bizMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showBizMenu) return
    const handler = (e: MouseEvent) => {
      if (bizMenuRef.current && !bizMenuRef.current.contains(e.target as Node)) {
        setShowBizMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showBizMenu])

  const handleBusinessSelect = (biz: Business) => {
    setCurrentBusiness(biz)
    setShowBizMenu(false)
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
    const items = [
      { to: '/businesses', label: 'Businesses', icon: 'businesses', roles: ['admin'] },
      { to: '/users',      label: 'Équipe',     icon: 'users',      roles: ['admin'] },
    ]
    if (!currentRole) return []
    return items.filter((i) => i.roles.includes(currentRole))
  }, [currentRole])

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  const renderNav = (items: typeof mainNav) =>
    items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={closeSidebarOnMobile}
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
        <NavLink to="/dashboard" onClick={closeSidebarOnMobile} className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06] hover:opacity-80 transition-opacity">
          <img src="/icon.png" alt="EMI" className="w-8 h-8 rounded-xl" />
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>EMI</h1>
            <p className="text-[9px] font-medium uppercase tracking-widest text-zinc-600 leading-none mt-0.5">Opérations Réussies</p>
          </div>
        </NavLink>

        {/* Business selector */}
        <div className="px-3 py-3 border-b border-white/[0.06]" ref={bizMenuRef}>
          {businesses?.length ? (
            <div className="relative">
              <button
                onClick={() => setShowBizMenu(v => !v)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.14] transition-all group"
              >
                {/* Business avatar */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emi-violet to-emi-violet-dark flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
                  {(currentBusiness?.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                    {currentBusiness?.name ?? 'Sélectionner'}
                  </p>
                  <p className="text-[9px] text-zinc-600 truncate">Business actif</p>
                </div>
                <Icon
                  name="chevron-down"
                  size={12}
                  className={`shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-transform duration-200 ${showBizMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showBizMenu && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#18181b] border border-white/[0.10] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Changer de business</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    {businesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleBusinessSelect(b)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors ${
                          currentBusiness?.id === b.id ? 'bg-emi-violet/15' : ''
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          currentBusiness?.id === b.id
                            ? 'bg-emi-violet text-white'
                            : 'bg-white/[0.08] text-zinc-400'
                        }`}>
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-xs font-medium truncate ${
                          currentBusiness?.id === b.id ? 'text-white' : 'text-zinc-300'
                        }`}>
                          {b.name}
                        </span>
                        {currentBusiness?.id === b.id && (
                          <svg className="ml-auto shrink-0 text-emi-violet" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  {isAnyAdmin && (
                    <div className="border-t border-white/[0.06] p-1.5">
                      <NavLink
                        to="/businesses"
                        onClick={() => { setShowBizMenu(false); closeSidebarOnMobile() }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-emi-violet hover:bg-emi-violet/10 rounded-lg transition-colors"
                      >
                        <Icon name="plus" size={12} /><span>Gérer les businesses</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isAnyAdmin ? (
            <NavLink
              to="/businesses"
              onClick={closeSidebarOnMobile}
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
          {/* User info row */}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emi-violet to-emi-violet-dark text-white flex items-center justify-center text-[11px] font-bold shrink-0">
              {(() => {
                const name = user?.fullName?.trim()
                if (name) return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
                const email = user?.email?.trim()
                if (email) return email.charAt(0).toUpperCase()
                return <Icon name="users" size={13} />
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                {user?.fullName?.trim() || user?.email || '—'}
              </p>
              {user?.fullName && (
                <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
              )}
            </div>
          </div>
          {/* Settings link */}
          <NavLink
            to="/settings"
            onClick={closeSidebarOnMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/12 text-white'
                  : 'text-zinc-400 hover:bg-white/6 hover:text-zinc-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 transition-colors ${isActive ? 'text-emi-violet' : 'text-zinc-500'}`}>
                  <Icon name="settings" size={17} />
                </span>
                <span>Paramètres</span>
              </>
            )}
          </NavLink>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <Icon name="logout" size={17} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Icon name="menu" size={22} />
          </button>
          <NavLink to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/icon.png" alt="EMI" className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-bold text-emi-violet" style={{ fontFamily: "'Montserrat', sans-serif" }}>EMI</span>
          </NavLink>
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
