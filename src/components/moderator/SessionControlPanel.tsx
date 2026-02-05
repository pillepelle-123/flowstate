import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, Text, Dialog, Portal } from 'react-native-paper'
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
  onPreviousSession: () => void
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
  onPreviousSession,
  onNextSession,
  onPushMaterial,
  onStartInteraction,
}: SessionControlPanelProps) {
  const [isExtending, setIsExtending] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<{
    title: string
    content: string
    onConfirm: () => void
  } | null>(null)

  const showDialog = (title: string, content: string, onConfirm: () => void) => {
    setDialogConfig({ title, content, onConfirm })
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setDialogConfig(null)
  }

  const handleConfirm = () => {
    if (dialogConfig?.onConfirm) {
      dialogConfig.onConfirm()
    }
    hideDialog()
  }

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

      showDialog(
        'Zeit verlängern',
        adjustment.message,
        () => onExtendTime(5, adjustment)
      )
    } finally {
      setIsExtending(false)
    }
  }

  const handlePreviousSession = () => {
    showDialog(
      'Vorherige Session',
      'Möchtest du zur vorherigen Session wechseln?',
      onPreviousSession
    )
  }

  const handleNextSession = () => {
    showDialog(
      'Nächste Session',
      'Möchtest du zur nächsten Session wechseln?',
      onNextSession
    )
  }

  const handleReset = () => {
    showDialog(
      'Workshop zurücksetzen',
      'Alle Sessions werden zurückgesetzt und der Workshop startet von vorne. Teilnehmer und Materialien bleiben erhalten.',
      onReset
    )
  }

  if (!currentSession) {
    return (
      <View style={{ padding: 16, backgroundColor: '#f3f4f6' }}>
        <Text variant="bodyLarge" style={{ textAlign: 'center', opacity: 0.6 }}>
          Keine aktive Session
        </Text>
      </View>
    )
  }

  const currentIndex = allSessions.findIndex(s => s.id === currentSession.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < allSessions.length - 1

  return (
    <View style={{ padding: 12, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
        <Button
          mode="contained"
          onPress={handlePreviousSession}
          disabled={!hasPrevious}
          style={{ flex: 1 }}
          compact
        >
          Zurück
        </Button>
        <Button
          mode="contained"
          onPress={handleExtendTime}
          disabled={isExtending}
          style={{ flex: 1 }}
          buttonColor="#10b981"
          compact
        >
          +5 Min
        </Button>
        <Button
          mode="contained"
          onPress={onPause}
          style={{ flex: 1 }}
          buttonColor={status === 'paused' ? '#10b981' : '#f59e0b'}
          compact
        >
          {status === 'paused' ? 'Fortsetzen' : 'Pause'}
        </Button>
        <Button
          mode="contained"
          onPress={handleNextSession}
          disabled={!hasNext}
          style={{ flex: 1 }}
          compact
        >
          Weiter
        </Button>
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Button
          mode="contained-tonal"
          onPress={onPushMaterial}
          style={{ flex: 1 }}
          compact
        >
          Material
        </Button>
        <Button
          mode="contained-tonal"
          onPress={onStartInteraction}
          style={{ flex: 1 }}
          compact
        >
          Interaktion
        </Button>
        <Button
          mode="contained"
          onPress={handleReset}
          buttonColor="#ef4444"
          style={{ flex: 1 }}
          compact
        >
          Reset
        </Button>
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{dialogConfig?.title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{dialogConfig?.content}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Abbrechen</Button>
            <Button onPress={handleConfirm}>Bestätigen</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}
