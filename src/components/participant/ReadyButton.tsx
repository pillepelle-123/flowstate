import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
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
    <Button
      mode="contained"
      onPress={handlePress}
      disabled={isReady || loading}
      loading={loading}
      buttonColor={isReady ? '#10b981' : undefined}
      style={{ borderRadius: 16, paddingVertical: 8 }}
      contentStyle={{ paddingVertical: 12 }}
      labelStyle={{ fontSize: 20, fontWeight: 'bold' }}
    >
      {isReady ? '✓ Fertig!' : '✋ Ich bin fertig'}
    </Button>
  )
}
