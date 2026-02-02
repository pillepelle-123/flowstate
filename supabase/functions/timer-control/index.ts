import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, workshopId, sessionId, extensionMinutes } = await req.json()

    if (!action || !workshopId) {
      throw new Error('Missing required parameters')
    }

    const now = new Date()

    switch (action) {
      case 'start': {
        if (!sessionId) throw new Error('sessionId required for start')
        
        const { data: session } = await supabase
          .from('sessions')
          .select('planned_duration')
          .eq('id', sessionId)
          .single()

        if (!session) throw new Error('Session not found')

        const endsAt = new Date(now.getTime() + session.planned_duration * 60000)

        await supabase
          .from('workshop_states')
          .update({
            current_session_id: sessionId,
            status: 'running',
            session_started_at: now.toISOString(),
            session_ends_at: endsAt.toISOString(),
            started_at: now.toISOString(),
            paused_at: null,
          })
          .eq('workshop_id', workshopId)

        break
      }

      case 'pause': {
        const { data: state } = await supabase
          .from('workshop_states')
          .select('session_ends_at')
          .eq('workshop_id', workshopId)
          .single()

        if (!state?.session_ends_at) throw new Error('No active session')

        const remainingMs = new Date(state.session_ends_at).getTime() - now.getTime()

        await supabase
          .from('workshop_states')
          .update({
            status: 'paused',
            paused_at: now.toISOString(),
            server_time_offset: remainingMs,
          })
          .eq('workshop_id', workshopId)

        break
      }

      case 'resume': {
        const { data: state } = await supabase
          .from('workshop_states')
          .select('server_time_offset')
          .eq('workshop_id', workshopId)
          .single()

        if (!state?.server_time_offset) throw new Error('No paused session')

        const newEndsAt = new Date(now.getTime() + state.server_time_offset)

        await supabase
          .from('workshop_states')
          .update({
            status: 'running',
            session_ends_at: newEndsAt.toISOString(),
            paused_at: null,
            server_time_offset: 0,
          })
          .eq('workshop_id', workshopId)

        break
      }

      case 'extend': {
        if (!extensionMinutes) throw new Error('extensionMinutes required')

        const { data: state } = await supabase
          .from('workshop_states')
          .select('session_ends_at')
          .eq('workshop_id', workshopId)
          .single()

        if (!state?.session_ends_at) throw new Error('No active session')

        const currentEndsAt = new Date(state.session_ends_at)
        const newEndsAt = new Date(currentEndsAt.getTime() + extensionMinutes * 60000)

        await supabase
          .from('workshop_states')
          .update({
            session_ends_at: newEndsAt.toISOString(),
          })
          .eq('workshop_id', workshopId)

        break
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, timestamp: now.toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
