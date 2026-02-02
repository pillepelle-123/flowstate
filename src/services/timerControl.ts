import { supabase } from './supabase'

export class TimerControlService {
  static async startSession(workshopId: string, sessionId: string, durationMinutes: number) {
    const now = new Date()
    const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

    const { error } = await supabase
      .from('workshop_states')
      .update({
        current_session_id: sessionId,
        status: 'running',
        session_started_at: now.toISOString(),
        session_ends_at: endsAt.toISOString(),
        started_at: now.toISOString(),
      })
      .eq('workshop_id', workshopId)

    if (error) throw error
  }

  static async pauseSession(workshopId: string) {
    const { error } = await supabase
      .from('workshop_states')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
      })
      .eq('workshop_id', workshopId)

    if (error) throw error
  }

  static async extendSession(workshopId: string, extensionMinutes: number) {
    const { data: state } = await supabase
      .from('workshop_states')
      .select('session_ends_at')
      .eq('workshop_id', workshopId)
      .single()

    if (!state?.session_ends_at) throw new Error('No active session')

    const currentEndsAt = new Date(state.session_ends_at)
    const newEndsAt = new Date(currentEndsAt.getTime() + extensionMinutes * 60 * 1000)

    const { error } = await supabase
      .from('workshop_states')
      .update({
        session_ends_at: newEndsAt.toISOString(),
      })
      .eq('workshop_id', workshopId)

    if (error) throw error
  }

  static async completeSession(workshopId: string, sessionId: string, actualDuration: number) {
    await supabase
      .from('sessions')
      .update({ actual_duration: actualDuration })
      .eq('id', sessionId)

    await supabase
      .from('workshop_states')
      .update({
        status: 'paused',
        current_session_id: null,
        session_started_at: null,
        session_ends_at: null,
      })
      .eq('workshop_id', workshopId)
  }
}
