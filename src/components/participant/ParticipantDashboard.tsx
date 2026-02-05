import React, { useEffect, useState, useMemo } from 'react'
import { View, ScrollView, Linking, Alert, StyleSheet } from 'react-native'
import { Text, Surface, Button, Card, Chip } from 'react-native-paper'
import { ParticipantService } from '../../services/participant'
import { NotificationService } from '../../services/notifications'
import { OfflineService } from '../../services/offline'
import { supabase } from '../../services/supabase'
import { useTimer } from '../../hooks/useTimer'
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
  const [showMaterialNotification, setShowMaterialNotification] = useState(false)
  const [showInteractionNotification, setShowInteractionNotification] = useState(false)
  const { remainingMs, status, currentSessionId } = useTimer(workshopId)

  useEffect(() => {
    loadWorkshopData()
    subscribeToWorkshopState()
    initializeServices()
    
    const heartbeat = setInterval(() => {
      ParticipantService.updateLastSeen(participant.id)
    }, 30000)

    return () => clearInterval(heartbeat)
  }, [workshopId])

  // Load session when currentSessionId changes
  useEffect(() => {
    if (currentSessionId) {
      loadCurrentSession()
    } else {
      setCurrentSession(null)
    }
  }, [currentSessionId])

  const loadCurrentSession = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', currentSessionId)
      .single()
    
    if (!error && data) {
      setCurrentSession(data)
    }
  }

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
        async (payload: any) => {
          const state = await ParticipantService.getCurrentSession(workshopId)
          if (state?.sessions) {
            setCurrentSession(state.sessions as Session)
          }
          
          // Handle material and interaction notifications
          if (payload.new?.show_material) {
            setShowMaterialNotification(true)
            setTimeout(() => setShowMaterialNotification(false), 5000)
          }
          if (payload.new?.show_interaction) {
            setShowInteractionNotification(true)
            setTimeout(() => setShowInteractionNotification(false), 5000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getTimerDisplay = useMemo(() => {
    if (typeof remainingMs !== 'number' || isNaN(remainingMs)) return '00:00'
    if (remainingMs <= 0) return '00:00'
    const totalSeconds = Math.floor(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [remainingMs])

  const getStatusText = useMemo(() => {
    if (status === 'running') return 'Verbleibende Zeit'
    if (status === 'paused') return 'Pausiert'
    return 'Bereit'
  }, [status])

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {showMaterialNotification && (
          <Surface style={styles.notificationBanner} elevation={4}>
            <Text variant="titleMedium" style={styles.notificationText}>
              📄 Material verfügbar!
            </Text>
          </Surface>
        )}
        
        {showInteractionNotification && (
          <Surface style={styles.notificationBanner} elevation={4}>
            <Text variant="titleMedium" style={styles.notificationText}>
              ✋ Interaktion gestartet!
            </Text>
          </Surface>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.label}>Workshop</Text>
            <Text variant="headlineMedium" style={styles.workshopTitle}>
              {workshop?.title ? String(workshop.title) : 'Lädt...'}
            </Text>
            <Text variant="bodyMedium" style={styles.participantInfo}>
              {`Teilnehmer: ${String(participant.display_name || participant.anonymous_id)}`}
            </Text>
          </Card.Content>
        </Card>

        {currentSession && (
          <Surface style={styles.sessionCard} elevation={2}>
            <Text variant="bodyMedium">Aktuelle Phase</Text>
            <Text variant="headlineSmall" style={styles.sessionTitle}>
              {String(currentSession.title || '')}
            </Text>
            
            <View style={styles.timerContainer}>
              <Surface style={styles.timerSurface} elevation={3}>
                <Text variant="displaySmall" style={styles.timerText}>{getTimerDisplay}</Text>
              </Surface>
              <Text variant="bodyMedium" style={styles.timerLabel}>{getStatusText}</Text>
            </View>
          </Surface>
        )}

        {currentSession && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.sectionLabel}>Interaktionen:</Text>
              
              <Button mode="contained" onPress={() => setActiveInteraction('ready')} style={styles.interactionButton} buttonColor="#10b981" icon="hand-back-right">
                Ich bin fertig
              </Button>

              <Button mode="contained" onPress={() => setActiveInteraction('matrix')} style={styles.interactionButton} buttonColor="#8b5cf6" icon="chart-scatter-plot">
                2D-Matrix Voting
              </Button>

              <Button mode="contained" onPress={() => setActiveInteraction('sticky')} style={styles.interactionButton} buttonColor="#f59e0b" icon="note-edit">
                Sticky Note erstellen
              </Button>
            </Card.Content>
          </Card>
        )}

        {materials && materials.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.sectionLabel}>Materialien:</Text>
              {materials.map((url, index) => (
                <Button key={index} mode="contained-tonal" onPress={() => handleOpenMaterial(url)} style={styles.materialButton} icon="file-document">
                  {`Material ${index + 1} öffnen`}
                </Button>
              ))}
            </Card.Content>
          </Card>
        )}

        <Button mode="contained" onPress={handleHelpRequest} style={styles.helpButton} buttonColor="#f97316" icon="help-circle" contentStyle={styles.helpButtonContent}>
          Hilfe anfordern
        </Button>

        {!currentSession && (
          <Surface style={styles.infoCard} elevation={1}>
            <Text variant="bodyLarge" style={styles.infoText}>
              Der Workshop hat noch nicht begonnen oder ist beendet.
            </Text>
          </Surface>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  notificationBanner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#10b981',
  },
  notificationText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  label: {
    opacity: 0.7,
  },
  workshopTitle: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  participantInfo: {
    marginTop: 8,
    opacity: 0.8,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eff6ff',
  },
  sessionChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sessionTitle: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  timerSurface: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  timerText: {
    fontWeight: 'bold',
  },
  timerLabel: {
    marginTop: 8,
    opacity: 0.7,
  },
  sectionLabel: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  interactionButton: {
    marginBottom: 8,
    borderRadius: 12,
  },
  materialButton: {
    marginBottom: 8,
    borderRadius: 12,
  },
  helpButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  helpButtonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  infoText: {
    textAlign: 'center',
    color: '#92400e',
  },
})
