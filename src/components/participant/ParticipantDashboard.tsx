import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native'
import { ParticipantService } from '../../services/participant'
import { NotificationService } from '../../services/notifications'
import { OfflineService } from '../../services/offline'
import { supabase } from '../../services/supabase'
import { useTimerStore } from '../../stores/timerStore'
import { InteractionContainer } from './InteractionContainer'
import { Database } from '../../types/database'

type Workshop = Database['public']['Tables']['workshops']['Row']
type Session = Database['public']['Tables']['sessions']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type InteractionType = 'ready' | 'matrix' | 'sticky' | null

interface ParticipantDashboardProps {
  workshopId: string
  participant: Participant
}

export function ParticipantDashboard({ workshopId, participant }: ParticipantDashboardProps) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [activeInteraction, setActiveInteraction] = useState<InteractionType>(null)
  const { remainingMs, status } = useTimerStore()

  useEffect(() => {
    loadWorkshopData()
    subscribeToWorkshopState()
    initializeServices()
    
    const heartbeat = setInterval(() => {
      ParticipantService.updateLastSeen(participant.id)
    }, 30000)

    return () => clearInterval(heartbeat)
  }, [workshopId])

  const initializeServices = async () => {
    await NotificationService.registerForPushNotifications()
    await OfflineService.initCache()
    
    const subscription = NotificationService.addNotificationListener((notification) => {
      Alert.alert(
        notification.request.content.title || 'Benachrichtigung',
        notification.request.content.body || ''
      )
    })

    return () => subscription.remove()
  }

  const loadWorkshopData = async () => {
    const cachedData = await OfflineService.getCachedWorkshopData(workshopId)
    if (cachedData) {
      setWorkshop(cachedData.workshop)
      setCurrentSession(cachedData.session)
    }

    const { data } = await ParticipantService.getWorkshopInfo(workshopId)
    if (data) {
      setWorkshop(data)
      await OfflineService.cacheWorkshopData(workshopId, { workshop: data })
    }

    const state = await ParticipantService.getCurrentSession(workshopId)
    if (state?.sessions) {
      setCurrentSession(state.sessions as Session)
    }
  }

  const subscribeToWorkshopState = () => {
    const channel = supabase
      .channel(`workshop_${workshopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workshop_states',
          filter: `workshop_id=eq.${workshopId}`,
        },
        async () => {
          const state = await ParticipantService.getCurrentSession(workshopId)
          if (state?.sessions) {
            setCurrentSession(state.sessions as Session)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleOpenMaterial = async (url: string) => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert('Fehler', 'Link kann nicht geöffnet werden')
    }
  }

  const handleHelpRequest = async () => {
    if (!currentSession) return

    const { error } = await ParticipantService.sendInteraction(
      currentSession.id,
      participant.id,
      'help_request',
      { timestamp: new Date().toISOString() }
    )

    if (!error) {
      Alert.alert('Hilfe angefordert', 'Der Moderator wurde benachrichtigt.')
    }
  }

  const materials = currentSession?.materials as string[] | null

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-6">
          {/* Workshop Header */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-sm text-gray-500">Workshop</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1">
              {workshop?.title || 'Lädt...'}
            </Text>
            <Text className="text-sm text-gray-600 mt-2">
              Teilnehmer: {participant.display_name || participant.anonymous_id}
            </Text>
          </View>

          {/* Current Session */}
          {currentSession && (
            <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <Text className="text-sm text-blue-600 font-semibold">Aktuelle Phase</Text>
              <Text className="text-xl font-bold text-blue-900 mt-1">
                {currentSession.title}
              </Text>
              
              {/* Timer */}
              <View className="mt-4 items-center">
                <View className="bg-white rounded-full px-6 py-3 shadow-md">
                  <Text className="text-3xl font-bold text-gray-900">
                    {status === 'running' ? formatTime(remainingMs) : '--:--'}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mt-2">
                  {status === 'running' ? 'Verbleibende Zeit' : 'Timer pausiert'}
                </Text>
              </View>
            </View>
          )}

          {/* Task Description */}
          {currentSession?.description && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-sm text-gray-500 font-semibold mb-2">Deine Aufgabe:</Text>
              <Text className="text-base text-gray-900">{currentSession.description}</Text>
            </View>
          )}

          {/* Interaktions-Buttons */}
          {currentSession && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-sm text-gray-500 font-semibold mb-3">Interaktionen:</Text>
              
              <TouchableOpacity
                onPress={() => setActiveInteraction('ready')}
                className="bg-green-500 py-3 px-4 rounded-lg mb-2"
              >
                <Text className="text-white font-semibold text-center">
                  ✋ Ich bin fertig
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveInteraction('matrix')}
                className="bg-purple-500 py-3 px-4 rounded-lg mb-2"
              >
                <Text className="text-white font-semibold text-center">
                  📊 2D-Matrix Voting
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveInteraction('sticky')}
                className="bg-yellow-500 py-3 px-4 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">
                  📝 Sticky Note erstellen
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Materials */}
          {materials && materials.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-sm text-gray-500 font-semibold mb-3">Materialien:</Text>
              {materials.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOpenMaterial(url)}
                  className="bg-blue-500 py-3 px-4 rounded-lg mb-2"
                >
                  <Text className="text-white font-semibold text-center">
                    Material {index + 1} öffnen
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Help Button */}
          <TouchableOpacity
            onPress={handleHelpRequest}
            className="bg-orange-500 py-4 px-6 rounded-lg shadow-md"
          >
            <Text className="text-white font-bold text-center text-lg">
              🆘 Hilfe anfordern
            </Text>
          </TouchableOpacity>

          {/* Info */}
          {!currentSession && (
            <View className="bg-yellow-50 rounded-lg p-4 mt-4 border border-yellow-200">
              <Text className="text-yellow-800 text-center">
                Der Workshop hat noch nicht begonnen oder ist beendet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Interaktions-Modal */}
      {currentSession && (
        <InteractionContainer
          sessionId={currentSession.id}
          participantId={participant.id}
          interactionType={activeInteraction}
          onClose={() => setActiveInteraction(null)}
        />
      )}
    </>
  )
}
