import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  display_name: string | null
}

export class UserService {
  static async searchUsersByEmail(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .ilike('email', `%${query}%`)
      .limit(10)
    
    if (error) throw error
    return data
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('email', email)
      .single()
    
    if (error) return null
    return data
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }

  static async getWorkshopCollaborators(workshopId: string): Promise<User[]> {
    const { data: workshopUsers, error: wuError } = await supabase
      .from('workshop_users')
      .select('user_id, role')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: true })
    
    if (wuError) throw wuError
    if (!workshopUsers?.length) return []
    
    const userIds = workshopUsers.map(wu => wu.user_id)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, display_name')
      .in('id', userIds)
    
    if (profileError) throw profileError
    
    return workshopUsers.map(wu => {
      const profile = profiles?.find(p => p.id === wu.user_id)
      return {
        id: wu.user_id,
        email: profile?.email || '',
        display_name: profile?.display_name || null,
        role: wu.role
      }
    }) as any
  }
}
