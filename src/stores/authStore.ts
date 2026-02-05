import { create } from 'zustand'
import { authService, AuthUser } from '../services/auth'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  error: string | null
  
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (displayName: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  initialize: async () => {
    try {
      set({ loading: true })
      
      // Get current user
      const user = await authService.getCurrentUser()
      set({ user, initialized: true, loading: false })

      // Listen to auth changes
      authService.onAuthStateChange((user) => {
        set({ user })
      })
    } catch (error: any) {
      // Ignore AbortController errors
      if (error?.message?.includes('aborted')) {
        return
      }
      console.error('Auth initialization error:', error)
      set({ user: null, initialized: true, loading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      await authService.signIn(email, password)
      const user = await authService.getCurrentUser()
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ loading: true })
    try {
      await authService.signUp(email, password, displayName)
      const user = await authService.getCurrentUser()
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await authService.signOut()
      set({ user: null, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  updateProfile: async (displayName: string) => {
    try {
      await authService.updateProfile(displayName)
      const user = await authService.getCurrentUser()
      set({ user })
    } catch (error) {
      throw error
    }
  },
}))
