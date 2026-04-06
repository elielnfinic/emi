import { create } from 'zustand'
import type { User, Business } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

// AdonisJS transformer objects have $type:"item" and store the real data
// in transformerData[0]. Unwrap so user.fullName / user.email work everywhere.
function normaliseUser(raw: any): User | null {
  if (!raw) return null
  if (raw.$type === 'item' && Array.isArray(raw.transformerData)) {
    const base = raw.transformerData[0] ?? {}
    return { ...base, role: raw.role, businessRoles: raw.businessRoles } as User
  }
  return raw as User
}

export const useAuthStore = create<AuthState>((set) => ({
  user: normaliseUser(JSON.parse(localStorage.getItem('auth_user') || 'null')),
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  setAuth: (user, token) => {
    localStorage.setItem('auth_user', JSON.stringify(user))
    localStorage.setItem('auth_token', token)
    set({ user, token, isAuthenticated: true })
  },
  setUser: (user) => {
    localStorage.setItem('auth_user', JSON.stringify(user))
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

interface AppState {
  currentBusiness: Business | null
  sidebarOpen: boolean
  setCurrentBusiness: (business: Business | null) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentBusiness: JSON.parse(localStorage.getItem('current_business') || 'null'),
  sidebarOpen: true,
  setCurrentBusiness: (business) => {
    if (business) {
      localStorage.setItem('current_business', JSON.stringify(business))
    } else {
      localStorage.removeItem('current_business')
    }
    set({ currentBusiness: business })
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const explicitTheme = localStorage.getItem('emi_theme') as Theme | null
const savedTheme: Theme = explicitTheme ?? (systemPrefersDark.matches ? 'dark' : 'light')

// Apply on init
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

/** Keep <meta name="theme-color"> in sync with the active theme so the
 *  browser chrome (iOS status bar, Android toolbar) matches the app body. */
function applyThemeColor(theme: Theme) {
  const color = theme === 'dark' ? '#09090B' : '#F8F8FB'
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((el) => {
    el.content = color
  })
}
// Sync on startup
applyThemeColor(savedTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: savedTheme,
  setTheme: (theme) => {
    localStorage.setItem('emi_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    applyThemeColor(theme)
    set({ theme })
  },
  toggle: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(next)
  },
}))

// Follow OS changes in real-time — only when the user hasn't set an explicit preference
systemPrefersDark.addEventListener('change', (e) => {
  if (localStorage.getItem('emi_theme')) return          // user has a saved choice → respect it
  const theme: Theme = e.matches ? 'dark' : 'light'
  useThemeStore.getState().setTheme(theme)
  localStorage.removeItem('emi_theme')                   // keep it as "following system"
})
