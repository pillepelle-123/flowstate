import { supabase } from './supabase'
import { Database } from '../types/database'

type Invitation = Database['public']['Tables']['workshop_invitations']['Row']
type InvitationInsert = Database['public']['Tables']['workshop_invitations']['Insert']

export class InvitationService {
  static async createInvitation(workshopId: string, email: string, invitedBy: string): Promise<Invitation> {
    const { data, error } = await supabase
      .from('workshop_invitations')
      .insert({
        workshop_id: workshopId,
        invited_by: invitedBy,
        invited_email: email,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async acceptInvitation(token: string, userId: string) {
    // 1. Get invitation
    const { data: invitation, error: invError } = await supabase
      .from('workshop_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()
    
    if (invError) throw new Error('Invitation not found or already used')
    
    // 2. Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired')
    }
    
    // 3. Add user to workshop as collaborator
    const { error: userError } = await supabase
      .from('workshop_users')
      .insert({
        workshop_id: invitation.workshop_id,
        user_id: userId,
        role: 'collaborator'
      })
    
    if (userError) throw userError
    
    // 4. Update invitation status
    await supabase
      .from('workshop_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)
    
    return invitation.workshop_id
  }

  static async declineInvitation(token: string) {
    const { error } = await supabase
      .from('workshop_invitations')
      .update({ status: 'declined' })
      .eq('token', token)
      .eq('status', 'pending')
    
    if (error) throw error
  }

  static async resendInvitation(invitationId: string) {
    // Generate new token and extend expiry
    const { data, error } = await supabase
      .from('workshop_invitations')
      .update({
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      })
      .eq('id', invitationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async cancelInvitation(invitationId: string) {
    const { error } = await supabase
      .from('workshop_invitations')
      .delete()
      .eq('id', invitationId)
    
    if (error) throw error
  }

  static async getPendingInvitations(workshopId: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('workshop_invitations')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  static async getInvitationByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await supabase
      .from('workshop_invitations')
      .select('*')
      .eq('token', token)
      .single()
    
    if (error) return null
    return data
  }

  static async getUserInvitations(email: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('workshop_invitations')
      .select('*, workshops(title)')
      .eq('invited_email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
