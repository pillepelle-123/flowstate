import { supabase } from './supabase'

export class TimeSync {
  private static serverTimeOffset: number = 0
  private static lastSyncTime: number = 0
  private static readonly SYNC_INTERVAL = 60000 // 1 Minute

  static async syncServerTime(): Promise<number> {
    const clientTime = Date.now()
    
    try {
      const { data, error } = await supabase.rpc('get_server_time')
      
      if (error) throw error
      
      const serverTime = new Date(data).getTime()
      const roundTripTime = Date.now() - clientTime
      const estimatedServerTime = serverTime + roundTripTime / 2
      
      this.serverTimeOffset = estimatedServerTime - Date.now()
      this.lastSyncTime = Date.now()
      
      return this.serverTimeOffset
    } catch (error) {
      console.error('Time sync failed:', error)
      return this.serverTimeOffset
    }
  }

  static getServerTime(): number {
    return Date.now() + this.serverTimeOffset
  }

  static getOffset(): number {
    return this.serverTimeOffset
  }

  static shouldResync(): boolean {
    return Date.now() - this.lastSyncTime > this.SYNC_INTERVAL
  }

  static async ensureSync(): Promise<number> {
    if (this.shouldResync()) {
      return await this.syncServerTime()
    }
    return this.serverTimeOffset
  }
}
