import { Database } from '../types/database'

type Session = Database['public']['Tables']['sessions']['Row']

export interface BufferAdjustment {
  type: 'reduce_buffer' | 'shift_end'
  affectedSessions: string[]
  newEndTime: Date
  message: string
}

export class BufferManager {
  /**
   * Berechnet die Auswirkung einer Zeitverlängerung
   * @param sessions Alle Sessions des Workshops (sortiert nach order_index)
   * @param currentSessionId ID der aktuellen Session
   * @param extensionMinutes Anzahl der zusätzlichen Minuten
   * @param workshopEndTime Geplantes Workshop-Ende
   * @returns BufferAdjustment mit Details zur Anpassung
   */
  static calculateBufferAdjustment(
    sessions: Session[],
    currentSessionId: string,
    extensionMinutes: number,
    workshopEndTime: Date
  ): BufferAdjustment {
    const currentIndex = sessions.findIndex(s => s.id === currentSessionId)
    const remainingSessions = sessions.slice(currentIndex + 1)
    
    // Finde verfügbare Buffer-Sessions
    const bufferSessions = remainingSessions.filter(s => s.is_buffer)
    const totalBufferMinutes = bufferSessions.reduce((sum, s) => sum + s.planned_duration, 0)

    if (totalBufferMinutes >= extensionMinutes) {
      // Fall 1: Genug Buffer vorhanden - reduziere Buffer-Sessions
      return this.reduceBufferSessions(bufferSessions, extensionMinutes, workshopEndTime)
    } else {
      // Fall 2: Nicht genug Buffer - verschiebe Workshop-Ende
      const deficit = extensionMinutes - totalBufferMinutes
      const newEndTime = new Date(workshopEndTime.getTime() + deficit * 60000)
      
      return {
        type: 'shift_end',
        affectedSessions: bufferSessions.map(s => s.id),
        newEndTime,
        message: `Workshop-Ende verschoben um ${deficit} Min. (alle Buffer aufgebraucht)`
      }
    }
  }

  private static reduceBufferSessions(
    bufferSessions: Session[],
    extensionMinutes: number,
    workshopEndTime: Date
  ): BufferAdjustment {
    let remaining = extensionMinutes
    const affected: string[] = []

    // Verteile Reduktion gleichmäßig auf Buffer-Sessions
    for (const buffer of bufferSessions) {
      if (remaining <= 0) break
      
      const reduction = Math.min(buffer.planned_duration, remaining)
      remaining -= reduction
      affected.push(buffer.id)
    }

    return {
      type: 'reduce_buffer',
      affectedSessions: affected,
      newEndTime: workshopEndTime,
      message: `${extensionMinutes} Min. von Buffer-Zeit abgezogen (${affected.length} Buffer-Session${affected.length > 1 ? 's' : ''})`
    }
  }

  /**
   * Wendet die Buffer-Anpassung auf die Sessions an
   */
  static applyBufferAdjustment(
    sessions: Session[],
    adjustment: BufferAdjustment,
    extensionMinutes: number
  ): Session[] {
    if (adjustment.type === 'reduce_buffer') {
      let remaining = extensionMinutes
      
      return sessions.map(session => {
        if (adjustment.affectedSessions.includes(session.id) && remaining > 0) {
          const reduction = Math.min(session.planned_duration, remaining)
          remaining -= reduction
          
          return {
            ...session,
            planned_duration: session.planned_duration - reduction
          }
        }
        return session
      })
    }
    
    return sessions
  }
}
