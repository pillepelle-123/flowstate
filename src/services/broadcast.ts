import { supabase } from './supabase'

export class BroadcastService {
  private static channel: ReturnType<typeof supabase.channel> | null = null

  static initChannel(workshopId: string) {
    if (this.channel) {
      this.channel.unsubscribe()
    }

    this.channel = supabase.channel(`workshop:${workshopId}`)
    return this.channel
  }

  static async broadcastTimerCommand(
    workshopId: string,
    command: 'start' | 'pause' | 'resume' | 'extend',
    payload?: any
  ) {
    const channel = this.initChannel(workshopId)
    
    await channel.send({
      type: 'broadcast',
      event: 'timer_command',
      payload: {
        command,
        timestamp: Date.now(),
        ...payload,
      },
    })
  }

  static subscribeToTimerCommands(
    workshopId: string,
    callback: (payload: any) => void
  ) {
    const channel = this.initChannel(workshopId)
    
    channel
      .on('broadcast', { event: 'timer_command' }, ({ payload }) => {
        callback(payload)
      })
      .subscribe()

    return () => channel.unsubscribe()
  }

  static cleanup() {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
  }
}
