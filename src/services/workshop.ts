import { supabase } from './supabase'
import { Database } from '../types/database'
import { WorkshopUserRole } from '../types/database'

type Workshop = Database['public']['Tables']['workshops']['Row']
type WorkshopInsert = Database['public']['Tables']['workshops']['Insert']
type WorkshopUpdate = Database['public']['Tables']['workshops']['Update']
type Session = Database['public']['Tables']['sessions']['Row']
type SessionInsert = Database['public']['Tables']['sessions']['Insert']
type SessionUpdate = Database['public']['Tables']['sessions']['Update']
type WorkshopUser = Database['public']['Tables']['workshop_users']['Row']
type WorkshopUserInsert = Database['public']['Tables']['workshop_users']['Insert']

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

  static async createWorkshop(workshop: WorkshopInsert, userId: string) {
    const { data, error } = await supabase
      .from('workshops')
      .insert({ ...workshop, created_by: userId })
      .select()
      .single()
    
    if (error) throw error
    
    // Initialize workshop_state
    await supabase
      .from('workshop_states')
      .insert({ workshop_id: data.id })
    
    // Owner relationship is auto-created via trigger
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
    // Cascade delete via FK constraints handles:
    // - workshop_users, sessions, workshop_states, interactions, workshop_invitations
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // ============================================
  // PHASE 2: WORKSHOP MANAGEMENT
  // ============================================

  static async getUserWorkshops(userId: string, includeArchived: boolean = false) {
    // First get workshop IDs for this user
    const { data: userWorkshops, error: userError } = await supabase
      .from('workshop_users')
      .select('workshop_id, role')
      .eq('user_id', userId)
    
    if (userError) throw userError
    if (!userWorkshops || userWorkshops.length === 0) return []

    const workshopIds = userWorkshops.map(w => w.workshop_id)

    // Then get workshops with those IDs
    let query = supabase
      .from('workshops')
      .select('*')
      .in('id', workshopIds)
      .order('created_at', { ascending: false })
    
    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }
    
    const { data: workshops, error } = await query
    if (error) throw error

    // Merge role data
    return workshops.map(workshop => ({
      ...workshop,
      workshop_users: [{ role: userWorkshops.find(uw => uw.workshop_id === workshop.id)?.role }]
    }))
  }

  static async getWorkshopRole(workshopId: string, userId: string): Promise<WorkshopUserRole | null> {
    const { data, error } = await supabase
      .from('workshop_users')
      .select('role')
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
      .single()
    
    if (error) return null
    return data.role
  }

  static async addUserToWorkshop(workshopId: string, userId: string, role: WorkshopUserRole) {
    const { data, error } = await supabase
      .from('workshop_users')
      .insert({ workshop_id: workshopId, user_id: userId, role })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async removeUserFromWorkshop(workshopId: string, userId: string) {
    const { error } = await supabase
      .from('workshop_users')
      .delete()
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
    
    if (error) throw error
  }

  static async archiveWorkshop(id: string) {
    const { data, error } = await supabase
      .from('workshops')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async restoreWorkshop(id: string) {
    const { data, error } = await supabase
      .from('workshops')
      .update({
        is_archived: false,
        archived_at: null
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async markAsCompleted(workshopId: string) {
    const { data, error } = await supabase
      .from('workshops')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', workshopId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async resetWorkshop(workshopId: string) {
    // 1. Reset workshop_states
    await supabase
      .from('workshop_states')
      .update({
        current_session_id: null,
        status: 'planned',
        started_at: null,
        paused_at: null,
        session_started_at: null,
        session_ends_at: null,
        server_time_offset: 0
      })
      .eq('workshop_id', workshopId)
    
    // 2. Get all session IDs for this workshop
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('workshop_id', workshopId)
    
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.id)
      
      // 3. Delete all interactions
      await supabase
        .from('interactions')
        .delete()
        .in('session_id', sessionIds)
    }
    
    // 4. Reset session actual_duration
    await supabase
      .from('sessions')
      .update({ actual_duration: null })
      .eq('workshop_id', workshopId)
    
    // 5. Set is_completed to false
    await supabase
      .from('workshops')
      .update({ is_completed: false, completed_at: null })
      .eq('id', workshopId)
  }

  static async duplicateAsTemplate(workshopId: string, userId: string) {
    // 1. Get original workshop
    const workshop = await this.getWorkshopById(workshopId)
    
    // 2. Create template workshop
    const template = await this.createWorkshop({
      title: `${workshop.title} (Template)`,
      description: workshop.description,
      date: null,
      total_duration: workshop.total_duration,
      buffer_strategy: workshop.buffer_strategy,
      is_template: true,
      is_archived: false,
      is_completed: false
    }, userId)
    
    // 3. Duplicate sessions
    const sessions = await this.getSessionsByWorkshopId(workshopId)
    for (const session of sessions) {
      await this.createSession({
        workshop_id: template.id,
        title: session.title,
        type: session.type,
        planned_duration: session.planned_duration,
        order_index: session.order_index,
        description: session.description,
        materials: session.materials,
        method_template_id: session.method_template_id,
        is_buffer: session.is_buffer
      })
    }
    
    return template
  }

  static async createFromTemplate(templateId: string, userId: string, newTitle: string, newDate: string | null) {
    // 1. Get template
    const template = await this.getWorkshopById(templateId)
    
    // 2. Create new workshop from template
    const workshop = await this.createWorkshop({
      title: newTitle,
      description: template.description,
      date: newDate,
      total_duration: template.total_duration,
      buffer_strategy: template.buffer_strategy,
      is_template: false,
      is_archived: false,
      is_completed: false
    }, userId)
    
    // 3. Duplicate sessions
    const sessions = await this.getSessionsByWorkshopId(templateId)
    for (const session of sessions) {
      await this.createSession({
        workshop_id: workshop.id,
        title: session.title,
        type: session.type,
        planned_duration: session.planned_duration,
        order_index: session.order_index,
        description: session.description,
        materials: session.materials,
        method_template_id: session.method_template_id,
        is_buffer: session.is_buffer
      })
    }
    
    return workshop
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

  static async completeSession(workshopId: string, sessionId: string) {
    // Check if this is the last session
    const sessions = await this.getSessionsByWorkshopId(workshopId)
    const sortedSessions = sessions.sort((a, b) => a.order_index - b.order_index)
    const lastSession = sortedSessions[sortedSessions.length - 1]
    
    if (lastSession.id === sessionId) {
      // Mark workshop as completed
      await this.markAsCompleted(workshopId)
    }
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

  // ============================================
  // PARTICIPANT NOTIFICATIONS
  // ============================================

  static async notifyParticipants(workshopId: string, type: 'material' | 'interaction') {
    const updates: any = {
      notification_updated_at: new Date().toISOString(),
    }
    
    if (type === 'material') {
      updates.show_material = true
    } else if (type === 'interaction') {
      updates.show_interaction = true
    }

    const { error } = await supabase
      .from('workshop_states')
      .update(updates)
      .eq('workshop_id', workshopId)
    
    if (error) throw error

    // Reset notification after 5 seconds
    setTimeout(async () => {
      const resetUpdates: any = {}
      if (type === 'material') resetUpdates.show_material = false
      if (type === 'interaction') resetUpdates.show_interaction = false
      
      await supabase
        .from('workshop_states')
        .update(resetUpdates)
        .eq('workshop_id', workshopId)
    }, 5000)
  }
}
