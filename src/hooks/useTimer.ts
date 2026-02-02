import { useEffect } from 'react'
import { useTimerStore } from '../stores/timerStore'
import { RealtimeService } from '../services/realtime'
import { WorkshopService } from '../services/workshop'

export function useTimer(workshopId: string | null) {
  const store = useTimerStore()

  useEffect(() => {
    if (!workshopId) return

    console.log('useTimer: Setting up for workshop', workshopId)
    store.setWorkshop(workshopId)

    // Initial state laden
    WorkshopService.getWorkshopState(workshopId).then((state) => {
      console.log('useTimer: Initial state loaded', state)
      if (state.session_started_at && state.session_ends_at) {
        store.setTimerData({
          sessionStartedAt: new Date(state.session_started_at).getTime(),
          sessionEndsAt: new Date(state.session_ends_at).getTime(),
        })
        // Set server time offset (may be 0)
        store.setServerTimeOffset(Number(state.server_time_offset) || 0)

        // Map backend status to local store statuses explicitly
        if (state.status === 'running') store.setStatus('running')
        else if (state.status === 'paused') store.setStatus('paused')
        else store.setStatus('idle')

        store.setSession(state.current_session_id || '')
        store.updateRemaining()
        console.log('useTimer: Timer data set, status:', state.status)
      }
    })

    // Realtime subscription
    const channel = RealtimeService.subscribeToWorkshopState(workshopId, (state) => {
      console.log('useTimer: Realtime update received', state)
      if (state.session_started_at && state.session_ends_at) {
        store.setTimerData({
          sessionStartedAt: new Date(state.session_started_at).getTime(),
          sessionEndsAt: new Date(state.session_ends_at).getTime(),
        })
        store.setServerTimeOffset(Number(state.server_time_offset) || 0)

        if (state.status === 'running') store.setStatus('running')
        else if (state.status === 'paused') store.setStatus('paused')
        else store.setStatus('idle')

        store.setSession(state.current_session_id || '')
        store.updateRemaining()
      }
    })

    return () => {
      RealtimeService.unsubscribe(workshopId)
    }
  }, [workshopId])

  // Timer Update Loop (100ms)
  useEffect(() => {
    console.log('useTimer: Status changed to', store.status)
    if (store.status !== 'running') return

    const interval = setInterval(() => {
      store.updateRemaining()
    }, 100)

    return () => clearInterval(interval)
  }, [store.status])

  return {
    remainingMs: store.remainingMs,
    status: store.status,
    currentSessionId: store.currentSessionId,
  }
}
