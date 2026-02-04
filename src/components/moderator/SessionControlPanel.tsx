import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { MotiView } from 'moti'
import { Database } from '../../types/database'
import { BufferManager, BufferAdjustment } from '../../utils/buffer'

type Session = Database['public']['Tables']['sessions']['Row']

interface SessionControlPanelProps {
  currentSession: Session | null
  allSessions: Session[]
  workshopEndTime: Date
  participantCount: number
  maxParticipants?: number
  status: 'idle' | 'running' | 'paused'
  onExtendTime: (minutes: number, adjustment: BufferAdjustment) => void
  onPause: () => void
  onReset: () => void
  onNextSession: () => void
  onPushMaterial: () => void
  onStartInteraction: () => void
}

export function SessionControlPanel({
  currentSession,
  allSessions,
  workshopEndTime,
  participantCount,
  maxParticipants,
  status,
  onExtendTime,
  onPause,
  onReset,
  onNextSession,
  onPushMaterial,
  onStartInteraction,
}: SessionControlPanelProps) {
  const [isExtending, setIsExtending] = useState(false)

  const handleExtendTime = () => {
    if (!currentSession) return
    
    setIsExtending(true)

    try {
      const adjustment = BufferManager.calculateBufferAdjustment(
        allSessions,
        currentSession.id,
        5,
        workshopEndTime
      )

      const confirmed = window.confirm(`Zeit verlängern\n\n${adjustment.message}\n\nBestätigen?`)
      if (confirmed) {
        onExtendTime(5, adjustment)
      }
    } finally {
      setIsExtending(false)
    }
  }

  const handleNextSession = () => {
    const confirmed = window.confirm('Möchtest du zur nächsten Session wechseln?')
    if (confirmed) {
      onNextSession()
    }
  }

  const handleReset = () => {
    const confirmed = window.confirm('Workshop komplett zurücksetzen?\n\nAlle Sessions werden zurückgesetzt und der Workshop startet von vorne. Teilnehmer und Materialien bleiben erhalten.')
    if (confirmed) {
      onReset()
    }
  }

  if (!currentSession) {
    return (
      <View style={{ padding: 24, backgroundColor: '#f3f4f6', borderRadius: 16 }}>
        <Text variant="bodyLarge" style={{ textAlign: 'center', opacity: 0.6 }}>
          Keine aktive Session
        </Text>
      </View>
    )
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={{ padding: 20, backgroundColor: '#fff', borderRadius: 16, elevation: 2 }}
    >
      <Text variant="headlineMedium" style={{ marginBottom: 4 }}>
        {currentSession.title}
      </Text>
      <Text variant="bodyMedium" style={{ opacity: 0.6, marginBottom: 20, textTransform: 'capitalize' }}>
        {currentSession.type}
      </Text>

      <View style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 12, marginBottom: 20 }}>
        <Text variant="titleMedium" style={{ color: '#1e40af' }}>
          Teilnehmer: {participantCount}{maxParticipants ? `/${maxParticipants}` : ''}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {status === 'idle' ? (
          <Button
            mode="contained"
            onPress={handleNextSession}
            style={{ flex: 1, borderRadius: 12 }}
            buttonColor="#10b981"
            icon="play"
          >
            Start
          </Button>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleExtendTime}
              disabled={isExtending}
              style={{ flex: 1, borderRadius: 12 }}
              buttonColor="#10b981"
            >
              +5 Min
            </Button>

            <Button
              mode="contained"
              onPress={onPause}
              disabled={status === 'idle'}
              style={{ flex: 1, borderRadius: 12 }}
              buttonColor={status === 'paused' ? '#10b981' : '#f59e0b'}
            >
              {status === 'paused' ? 'Fortsetzen' : 'Pause'}
            </Button>

            <Button
              mode="contained"
              onPress={handleNextSession}
              style={{ flex: 1, borderRadius: 12 }}
            >
              Weiter
            </Button>
          </>
        )}
      </View>

      {status !== 'idle' ? (
        <Button
          mode="contained"
          onPress={handleReset}
          style={{ marginBottom: 12, borderRadius: 12 }}
          buttonColor="#ef4444"
        >
          Reset
        </Button>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          mode="contained-tonal"
          onPress={onPushMaterial}
          style={{ flex: 1, borderRadius: 12 }}
        >
          Material
        </Button>

        <Button
          mode="contained-tonal"
          onPress={onStartInteraction}
          style={{ flex: 1, borderRadius: 12 }}
        >
          Interaktion
        </Button>
      </View>

      {currentSession.description ? (
        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12 }}>
          <Text variant="bodyMedium">{currentSession.description}</Text>
        </View>
      ) : null}
    </MotiView>
  )
}
