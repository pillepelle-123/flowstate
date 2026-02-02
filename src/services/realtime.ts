import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map()

  static subscribeToWorkshopState(
    workshopId: string,
    onUpdate: (state: any) => void
  ) {
    const channelName = `workshop_state:${workshopId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workshop_states',
          filter: `workshop_id=eq.${workshopId}`,
        },
        (payload) => {
          onUpdate(payload.new)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  static unsubscribe(workshopId: string) {
    const channelName = `workshop_state:${workshopId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  static async broadcastTimerCommand(
    workshopId: string,
    command: { action: 'start' | 'pause' | 'extend'; sessionId?: string; extensionMinutes?: number }
  ) {
    const channel = supabase.channel(`timer_commands:${workshopId}`)
    await channel.send({
      type: 'broadcast',
      event: 'timer_command',
      payload: command,
    })
  }
}
