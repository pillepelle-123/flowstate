import { supabase } from './supabase'
import { Database } from '../types/database'

type MethodTemplate = Database['public']['Tables']['method_templates']['Row']
type MethodTemplateInsert = Database['public']['Tables']['method_templates']['Insert']

export const MethodTemplateService = {
  async getAll(): Promise<MethodTemplate[]> {
    const { data, error } = await supabase
      .from('method_templates')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(template: MethodTemplateInsert): Promise<MethodTemplate> {
    const { data, error } = await supabase
      .from('method_templates')
      .insert(template)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
