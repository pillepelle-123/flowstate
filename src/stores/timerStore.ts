import { create } from 'zustand'

interface TimerState {
  workshopId: string | null
  currentSessionId: string | null
  status: 'idle' | 'running' | 'paused'
  sessionStartedAt: number | null
  sessionEndsAt: number | null
  serverTimeOffset: number
  remainingMs: number
  
  setWorkshop: (workshopId: string) => void
  setSession: (sessionId: string) => void
  setStatus: (status: 'idle' | 'running' | 'paused') => void
  setTimerData: (data: { sessionStartedAt: number; sessionEndsAt: number }) => void
  setServerTimeOffset: (offset: number) => void
  updateRemaining: () => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  workshopId: null,
  currentSessionId: null,
  status: 'idle',
  sessionStartedAt: null,
  sessionEndsAt: null,
  serverTimeOffset: 0,
  remainingMs: 0,

  setWorkshop: (workshopId) => set({ workshopId }),
  
  setSession: (sessionId) => set({ currentSessionId: sessionId }),
  
  setStatus: (status) => set({ status }),
  
  setTimerData: (data) => set({
    sessionStartedAt: data.sessionStartedAt,
    sessionEndsAt: data.sessionEndsAt,
  }),
  
  setServerTimeOffset: (offset) => set({ serverTimeOffset: offset }),
  
  updateRemaining: () => {
    const state = get()
    // If running, compute remaining from sessionEndsAt and serverTimeOffset
    if (state.sessionEndsAt && state.status === 'running') {
      const now = Date.now() + state.serverTimeOffset
      const remaining = Math.max(0, state.sessionEndsAt - now)
      set({ remainingMs: remaining })
      return
    }

    // If paused and serverTimeOffset is set, show that as remaining
    if (state.status === 'paused' && state.serverTimeOffset && state.serverTimeOffset > 0) {
      set({ remainingMs: state.serverTimeOffset })
      return
    }

    // Fallback: if we have sessionEndsAt, compute remaining normally
    if (state.sessionEndsAt) {
      const remaining = Math.max(0, state.sessionEndsAt - Date.now())
      set({ remainingMs: remaining })
      return
    }
  },
  
  reset: () => set({
    workshopId: null,
    currentSessionId: null,
    status: 'idle',
    sessionStartedAt: null,
    sessionEndsAt: null,
    remainingMs: 0,
  }),
}))
