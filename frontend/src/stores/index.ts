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

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
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
