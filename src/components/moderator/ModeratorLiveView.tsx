import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
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
      await WorkshopService.resetSession(workshopId)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Failed to reset session:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
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

  const handlePushMaterial = () => {
    console.log('Push material')
  }

  const handleStartInteraction = () => {
    console.log('Start interaction')
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (!workshop) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-xl text-gray-500">Workshop nicht gefunden</Text>
      </View>
    )
  }

  const totalMs = currentSession ? currentSession.planned_duration * 60000 : 0
  const workshopEndTime = new Date(workshop.date)
  workshopEndTime.setMinutes(workshopEndTime.getMinutes() + workshop.total_duration)

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Workshop-Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {workshop.title}
          </Text>
          <Text className="text-sm text-gray-500">
            Status: {status === 'running' ? '🟢 Läuft' : status === 'paused' ? '🟡 Pausiert' : '⚪ Bereit'}
          </Text>
        </View>

        {/* Ring-Timer */}
        <View className="items-center mb-8">
          <RingProgressTimer
            remainingMs={remainingMs}
            totalMs={totalMs}
            size={280}
            strokeWidth={20}
          />
        </View>

        {/* Ready-Progress (Phase 7) */}
        {currentSession && (
          <View className="mb-6">
            <ReadyProgress sessionId={currentSession.id} workshopId={workshopId} />
          </View>
        )}

        {/* Control Panel */}
        <SessionControlPanel
          currentSession={currentSession}
          allSessions={sessions}
          workshopEndTime={workshopEndTime}
          participantCount={0}
          status={status}
          onExtendTime={handleExtendTime}
          onPause={handlePause}
          onReset={handleReset}
          onNextSession={handleNextSession}
          onPushMaterial={handlePushMaterial}
          onStartInteraction={handleStartInteraction}
        />

        {/* Beamer-Steuerung */}
        <BeamerControl workshopId={workshopId} />

        {/* QR-Code für Teilnehmer */}
        <View className="mt-6">
          <QRCodeModal workshopId={workshopId} />
        </View>

        {/* Session-Übersicht */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Kommende Sessions
          </Text>
          {sessions
            .filter(s => s.order_index > (currentSession?.order_index || -1))
            .slice(0, 3)
            .map(session => (
              <View
                key={session.id}
                className="p-4 bg-white rounded-lg mb-2 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{session.title}</Text>
                  <Text className="text-sm text-gray-500 capitalize">{session.type}</Text>
                </View>
                <Text className="text-sm font-medium text-gray-700">
                  {session.planned_duration} Min
                  {session.is_buffer && ' 🔵'}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  )
}
