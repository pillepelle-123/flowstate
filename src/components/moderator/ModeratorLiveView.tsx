import React, { useEffect, useState } from 'react'
import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { Text, Chip, Surface } from 'react-native-paper'
import { useTimer } from '../../hooks/useTimer'
import { RingProgressTimer } from '../shared/RingProgressTimer'
import { SessionControlPanel } from './SessionControlPanel'
import { BeamerControl } from './BeamerControl'
import { QRCodeModal } from './QRCodeModal'
import { ReadyProgress } from './ReadyProgress'
import { WorkshopService } from '../../services/workshop'
import { Database } from '../../types/database'
import { BufferAdjustment, BufferManager } from '../../utils/buffer'
import * as Haptics from 'expo-haptics'

type Workshop = Database['public']['Tables']['workshops']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface ModeratorLiveViewProps {
  workshopId: string
}

export function ModeratorLiveView({ workshopId }: ModeratorLiveViewProps) {
  const { remainingMs, status, currentSessionId } = useTimer(workshopId)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkshopData()
  }, [workshopId])

  useEffect(() => {
    if (currentSessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === currentSessionId)
      setCurrentSession(session || null)
    } else if (!currentSessionId && sessions.length > 0) {
      // Wenn keine Session aktiv ist, lade die erste Session
      setCurrentSession(sessions[0])
    }
  }, [currentSessionId, sessions])

  const loadWorkshopData = async () => {
    try {
      const [workshopData, sessionsData] = await Promise.all([
        WorkshopService.getWorkshop(workshopId),
        WorkshopService.getSessions(workshopId),
      ])
      
      setWorkshop(workshopData)
      setSessions(sessionsData.sort((a, b) => a.order_index - b.order_index))
    } catch (error) {
      console.error('Failed to load workshop data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExtendTime = async (minutes: number, adjustment: BufferAdjustment) => {
    try {
      const updatedSessions = BufferManager.applyBufferAdjustment(
        sessions,
        adjustment,
        minutes
      )

      for (const session of updatedSessions) {
        if (adjustment.affectedSessions.includes(session.id)) {
          await WorkshopService.updateSession(session.id, {
            planned_duration: session.planned_duration,
          })
        }
      }

      setSessions(updatedSessions)
      await WorkshopService.extendTimer(workshopId, currentSessionId!, minutes)
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Failed to extend time:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handlePause = async () => {
    try {
      if (status === 'paused') {
        if (remainingMs && remainingMs > 0) {
          await WorkshopService.resumeTimer(workshopId)
        } else {
          console.warn('No paused session to resume (remainingMs:', remainingMs, ')')
          return
        }
      } else {
        await WorkshopService.pauseTimer(workshopId)
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Failed to pause/resume:', error)
    }
  }

  const handleReset = async () => {
    try {
      await WorkshopService.resetWorkshop(workshopId)
      await loadWorkshopData()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Failed to reset workshop:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handlePreviousSession = async () => {
    try {
      const currentIndex = sessions.findIndex(s => s.id === currentSessionId)
      const previousSession = sessions[currentIndex - 1]
      
      if (previousSession) {
        await WorkshopService.startSession(workshopId, previousSession.id)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      console.error('Failed to start previous session:', error)
    }
  }

  const handleNextSession = async () => {
    try {
      const currentIndex = sessions.findIndex(s => s.id === currentSessionId)
      const nextSession = sessions[currentIndex + 1]
      
      if (nextSession) {
        await WorkshopService.startSession(workshopId, nextSession.id)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      console.error('Failed to start next session:', error)
    }
  }

  const handlePushMaterial = async () => {
    try {
      await WorkshopService.notifyParticipants(workshopId, 'material')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Failed to push material notification:', error)
    }
  }

  const handleStartInteraction = async () => {
    try {
      await WorkshopService.notifyParticipants(workshopId, 'interaction')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Failed to push interaction notification:', error)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!workshop) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleLarge" style={{ opacity: 0.6 }}>Workshop nicht gefunden</Text>
      </View>
    )
  }

  const totalMs = currentSession ? currentSession.planned_duration * 60000 : 0
  const displayRemainingMs = (status === 'idle' || !currentSessionId) && currentSession ? totalMs : remainingMs
  const workshopEndTime = new Date(workshop.date)
  workshopEndTime.setMinutes(workshopEndTime.getMinutes() + workshop.total_duration)

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 220 }}>
        <View style={styles.content}>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 24 }}>
          {currentSession && (
            <View style={{ flex: 1, minWidth: 280, alignItems: 'center' }}>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {currentSession.title}
              </Text>
              <Text variant="bodyMedium" style={{ opacity: 0.6, textTransform: 'capitalize' }}>
                {currentSession.type}
              </Text>
            </View>
          )}

          <View style={{ flex: 1, minWidth: 280, alignItems: 'center' }}>
            <RingProgressTimer
              remainingMs={displayRemainingMs}
              totalMs={totalMs}
              size={280}
              strokeWidth={20}
              status={status}
            />
          </View>
        </View>

        {currentSession && (
          <View style={styles.section}>
            <ReadyProgress sessionId={currentSession.id} workshopId={workshopId} />
          </View>
        )}

        <View style={styles.section}>
          <BeamerControl workshopId={workshopId} />
        </View>

        <View style={styles.section}>
          <QRCodeModal workshopId={workshopId} />
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Kommende Sessions
          </Text>
          {sessions
            .filter(s => s.order_index > (currentSession?.order_index || -1))
            .slice(0, 3)
            .map(session => (
              <Surface
                key={session.id}
                style={styles.sessionCard}
                elevation={1}
              >
                <View style={styles.sessionCardContent}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{session.title}</Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.6, textTransform: 'capitalize' }}>
                      {session.type}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {session.planned_duration} Min{session.is_buffer && ' 🔵'}
                  </Text>
                </View>
              </Surface>
            ))}
        </View>
        </View>
      </ScrollView>

      <View style={styles.fixedControls}>
        <SessionControlPanel
          currentSession={currentSession}
          allSessions={sessions}
          workshopEndTime={workshopEndTime}
          participantCount={0}
          status={status}
          onExtendTime={handleExtendTime}
          onPause={handlePause}
          onReset={handleReset}
          onPreviousSession={handlePreviousSession}
          onNextSession={handleNextSession}
          onPushMaterial={handlePushMaterial}
          onStartInteraction={handleStartInteraction}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sessionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fixedControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
})
