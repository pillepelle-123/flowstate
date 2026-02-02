import { supabase } from './supabase'
import { Database } from '../types/database'

type Workshop = Database['public']['Tables']['workshops']['Row']
type WorkshopInsert = Database['public']['Tables']['workshops']['Insert']
type WorkshopUpdate = Database['public']['Tables']['workshops']['Update']
type Session = Database['public']['Tables']['sessions']['Row']
type SessionInsert = Database['public']['Tables']['sessions']['Insert']
type SessionUpdate = Database['public']['Tables']['sessions']['Update']

export class WorkshopService {
  // ============================================
  // WORKSHOPS
  // ============================================

  static async getWorkshops() {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getWorkshopById(id: string) {
    const { data, error } = await supabase
      .from('workshops')
      .select('*, sessions(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createWorkshop(workshop: WorkshopInsert) {
    const { data, error } = await supabase
      .from('workshops')
      .insert({ ...workshop, created_by: null })
      .select()
      .single()
    
    if (error) throw error
    
    // Erstelle automatisch workshop_state
    await supabase
      .from('workshop_states')
      .insert({ workshop_id: data.id })
    
    return data
  }

  static async updateWorkshop(id: string, updates: WorkshopUpdate) {
    const { data, error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteWorkshop(id: string) {
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // ============================================
  // SESSIONS
  // ============================================

  static async getSessionsByWorkshopId(workshopId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('order_index', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createSession(session: SessionInsert) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateSession(id: string, updates: SessionUpdate) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteSession(id: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async reorderSessions(workshopId: string, sessionIds: string[]) {
    const updates = sessionIds.map((id, index) => 
      supabase
        .from('sessions')
        .update({ order_index: index })
        .eq('id', id)
    )
    
    await Promise.all(updates)
  }

  // ============================================
  // WORKSHOP STATE
  // ============================================

  static async getWorkshopState(workshopId: string) {
    const { data, error } = await supabase
      .from('workshop_states')
      .select('*')
      .eq('workshop_id', workshopId)
      .single()
    
    if (error) throw error
    return data
  }

  // Alias-Methoden für Phase 3
  static async getWorkshop(id: string) {
    return this.getWorkshopById(id)
  }

  static async getSessions(workshopId: string) {
    return this.getSessionsByWorkshopId(workshopId)
  }

  // ============================================
  // TIMER CONTROL
  // ============================================

  static async startSession(workshopId: string, sessionId: string) {
    const session = await supabase
      .from('sessions')
      .select('planned_duration')
      .eq('id', sessionId)
      .single()
    
    if (session.error) throw session.error

    const now = new Date()
    const endsAt = new Date(now.getTime() + session.data.planned_duration * 60000)

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

  static async pauseTimer(workshopId: string) {
    const state = await this.getWorkshopState(workshopId)
    
    if (!state.session_ends_at) throw new Error('No active session')

    const now = new Date()
    const remainingMs = new Date(state.session_ends_at).getTime() - now.getTime()

    const { error } = await supabase
      .from('workshop_states')
      .update({
        status: 'paused',
        paused_at: now.toISOString(),
        server_time_offset: remainingMs,
      })
      .eq('workshop_id', workshopId)
    
    if (error) throw error
  }

  static async resumeTimer(workshopId: string) {
    const state = await this.getWorkshopState(workshopId)
    
    let remainingMs = Number(state.server_time_offset) || 0

    // If server_time_offset is not available or zero, try fallback using paused_at
    if (remainingMs <= 0) {
      if (state.paused_at && state.session_ends_at) {
        const pausedAt = new Date(state.paused_at).getTime()
        const endsAt = new Date(state.session_ends_at).getTime()
        const pausedRemaining = Math.max(0, endsAt - pausedAt)
        remainingMs = pausedRemaining
      }
    }

    if (remainingMs <= 0) throw new Error('No paused session')

    const now = new Date()
    const newEndsAt = new Date(now.getTime() + remainingMs)

    const { error } = await supabase
      .from('workshop_states')
      .update({
        status: 'running',
        session_ends_at: newEndsAt.toISOString(),
        paused_at: null,
        server_time_offset: 0,
      })
      .eq('workshop_id', workshopId)
    
    if (error) throw error
  }

  static async extendTimer(workshopId: string, sessionId: string, minutes: number) {
    const state = await this.getWorkshopState(workshopId)
    
    if (!state.session_ends_at) throw new Error('No active session')

    const currentEndsAt = new Date(state.session_ends_at)
    const newEndsAt = new Date(currentEndsAt.getTime() + minutes * 60000)

    const { error } = await supabase
      .from('workshop_states')
      .update({
        session_ends_at: newEndsAt.toISOString(),
      })
      .eq('workshop_id', workshopId)
    
    if (error) throw error
  }

  static async resetSession(workshopId: string) {
    const { error } = await supabase
      .from('workshop_states')
      .update({
        status: 'paused',
        session_started_at: null,
        session_ends_at: null,
        paused_at: null,
        server_time_offset: 0,
        current_session_id: null,
      })
      .eq('workshop_id', workshopId)
    
    if (error) throw error
  }
}
