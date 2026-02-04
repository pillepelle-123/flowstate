import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Get workshop details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: workshop } = await supabase
      .from('workshops')
      .select('title')
      .eq('id', record.workshop_id)
      .single()
    
    const { data: inviter } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', record.invited_by)
      .single()
    
    const acceptUrl = `${Deno.env.get('APP_URL')}/invitation/accept?token=${record.token}`
    const declineUrl = `${Deno.env.get('APP_URL')}/invitation/decline?token=${record.token}`
    
    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FlowState <noreply@flowstate.app>',
        to: [record.invited_email],
        subject: `You've been invited to collaborate on "${workshop?.title}"`,
        html: `
          <h2>Workshop Invitation</h2>
          <p>Hi there!</p>
          <p><strong>${inviter?.display_name || inviter?.email}</strong> has invited you to collaborate on the workshop:</p>
          <h3>${workshop?.title}</h3>
          <p>Click below to accept or decline this invitation:</p>
          <p>
            <a href="${acceptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6200ee; color: white; text-decoration: none; border-radius: 4px; margin-right: 8px;">Accept Invitation</a>
            <a href="${declineUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f5f5f5; color: #333; text-decoration: none; border-radius: 4px;">Decline</a>
          </p>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        `,
      }),
    })
    
    const data = await res.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
