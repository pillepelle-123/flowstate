import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ParticipantService } from '../../services/participant'

interface ReadyButtonProps {
  sessionId: string
  participantId: string
  onReady?: () => void
}

export function ReadyButton({ sessionId, participantId, onReady }: ReadyButtonProps) {
  const [isReady, setIsReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePress = async () => {
    if (loading) return

    setLoading(true)
    const { error } = await ParticipantService.sendInteraction(
      sessionId,
      participantId,
      'ready_signal',
      { timestamp: new Date().toISOString() }
    )

    setLoading(false)

    if (!error) {
      setIsReady(true)
      onReady?.()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isReady || loading}
      className={`py-6 px-8 rounded-xl ${
        isReady ? 'bg-green-500' : 'bg-blue-500'
      }`}
    >
      <Text className="text-white font-bold text-center text-2xl">
        {isReady ? '✓ Fertig!' : loading ? 'Sende...' : '✋ Ich bin fertig'}
      </Text>
    </TouchableOpacity>
  )
}
