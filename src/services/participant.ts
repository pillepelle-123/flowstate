import { supabase } from './supabase'
import { Database } from '../types/database'

type Participant = Database['public']['Tables']['participants']['Row']
type ParticipantInsert = Database['public']['Tables']['participants']['Insert']

export class ParticipantService {
  // Anonymous Sign-in und Teilnehmer erstellen
  static async joinWorkshop(workshopId: string, displayName?: string): Promise<{ participant: Participant; error: null } | { participant: null; error: string }> {
    try {
      // Anonymous Sign-in
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      
      if (authError) {
        return { participant: null, error: authError.message }
      }

      // Generiere anonymous_id
      const anonymousId = `Teilnehmer-${Math.floor(Math.random() * 9999) + 1}`

      // Erstelle Teilnehmer-Eintrag
      const participantData: ParticipantInsert = {
        workshop_id: workshopId,
        anonymous_id: anonymousId,
        display_name: displayName || null,
      }

      const { data, error } = await supabase
        .from('participants')
        .insert(participantData)
        .select()
        .single()

      if (error) {
        return { participant: null, error: error.message }
      }

      return { participant: data, error: null }
    } catch (err) {
      return { participant: null, error: String(err) }
    }
  }

  // Heartbeat für last_seen
  static async updateLastSeen(participantId: string): Promise<void> {
    await supabase
      .from('participants')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', participantId)
  }

  // Hole Workshop-Info
  static async getWorkshopInfo(workshopId: string) {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .single()

    return { data, error }
  }

  // Hole aktuelle Session
  static async getCurrentSession(workshopId: string) {
    const { data: state } = await supabase
      .from('workshop_states')
      .select('*, sessions(*)')
      .eq('workshop_id', workshopId)
      .single()

    return state
  }

  // Sende Interaktion
  static async sendInteraction(
    sessionId: string,
    participantId: string,
    type: Database['public']['Tables']['interactions']['Row']['type'],
    data: any
  ) {
    const { error } = await supabase
      .from('interactions')
      .insert({
        session_id: sessionId,
        participant_id: participantId,
        type,
        data,
      })

    return { error }
  }
}
