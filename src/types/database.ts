// Generated Database Types for FlowState
// Phase 1: Fundament & Datenmodell

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type WorkshopBufferStrategy = 'fixed' | 'distributed' | 'end'
export type SessionType = 'input' | 'interaction' | 'individual' | 'group' | 'break' | 'orga'
export type WorkshopStatus = 'planned' | 'running' | 'paused' | 'completed'
export type InteractionType = 'vote_2d' | 'sticky_note' | 'ready_signal' | 'help_request'

export interface Database {
  public: {
    Tables: {
      workshops: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string | null
          total_duration: number
          buffer_strategy: WorkshopBufferStrategy
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date?: string | null
          total_duration: number
          buffer_strategy?: WorkshopBufferStrategy
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string | null
          total_duration?: number
          buffer_strategy?: WorkshopBufferStrategy
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          workshop_id: string
          title: string
          type: SessionType
          planned_duration: number
          actual_duration: number | null
          order_index: number
          description: string | null
          materials: Json
          method_template_id: string | null
          is_buffer: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workshop_id: string
          title: string
          type: SessionType
          planned_duration: number
          actual_duration?: number | null
          order_index: number
          description?: string | null
          materials?: Json
          method_template_id?: string | null
          is_buffer?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          title?: string
          type?: SessionType
          planned_duration?: number
          actual_duration?: number | null
          order_index?: number
          description?: string | null
          materials?: Json
          method_template_id?: string | null
          is_buffer?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workshop_states: {
        Row: {
          id: string
          workshop_id: string
          current_session_id: string | null
          status: WorkshopStatus
          started_at: string | null
          paused_at: string | null
          server_time_offset: number
          session_started_at: string | null
          session_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workshop_id: string
          current_session_id?: string | null
          status?: WorkshopStatus
          started_at?: string | null
          paused_at?: string | null
          server_time_offset?: number
          session_started_at?: string | null
          session_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          current_session_id?: string | null
          status?: WorkshopStatus
          started_at?: string | null
          paused_at?: string | null
          server_time_offset?: number
          session_started_at?: string | null
          session_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          workshop_id: string
          anonymous_id: string
          display_name: string | null
          joined_at: string
          last_seen: string
        }
        Insert: {
          id?: string
          workshop_id: string
          anonymous_id: string
          display_name?: string | null
          joined_at?: string
          last_seen?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          anonymous_id?: string
          display_name?: string | null
          joined_at?: string
          last_seen?: string
        }
      }
      interactions: {
        Row: {
          id: string
          session_id: string
          participant_id: string
          type: InteractionType
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          participant_id: string
          type: InteractionType
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          participant_id?: string
          type?: InteractionType
          data?: Json
          created_at?: string
        }
      }
      method_templates: {
        Row: {
          id: string
          name: string
          category: string | null
          default_duration: number | null
          description: string | null
          materials: Json
          instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          default_duration?: number | null
          description?: string | null
          materials?: Json
          instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          default_duration?: number | null
          description?: string | null
          materials?: Json
          instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
