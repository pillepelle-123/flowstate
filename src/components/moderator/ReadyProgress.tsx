import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { supabase } from '../../services/supabase'

interface ReadyProgressProps {
  sessionId: string
  workshopId: string
}

export function ReadyProgress({ sessionId, workshopId }: ReadyProgressProps) {
  const [readyCount, setReadyCount] = useState(0)
  const [totalParticipants, setTotalParticipants] = useState(0)

  useEffect(() => {
    loadCounts()
    subscribeToInteractions()
  }, [sessionId, workshopId])

  const loadCounts = async () => {
    // Zähle Ready-Signale
    const { count: ready } = await supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('type', 'ready_signal')

    // Zähle Teilnehmer
    const { count: total } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId)

    setReadyCount(ready || 0)
    setTotalParticipants(total || 0)
  }

  const subscribeToInteractions = () => {
    const channel = supabase
      .channel(`ready_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new.type === 'ready_signal') {
            setReadyCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const percentage = totalParticipants > 0 ? (readyCount / totalParticipants) * 100 : 0

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-sm text-gray-500 font-semibold mb-2">
        Teilnehmer-Fortschritt
      </Text>
      
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl font-bold text-gray-900">
          {readyCount}/{totalParticipants}
        </Text>
        <Text className="text-sm text-gray-600 ml-2">fertig</Text>
      </View>

      {/* Progress Bar */}
      <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>

      <Text className="text-xs text-gray-500 mt-1 text-right">
        {Math.round(percentage)}%
      </Text>
    </View>
  )
}
