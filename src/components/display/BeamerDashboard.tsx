import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useTimer } from '../../hooks/useTimer'
import { WorkshopService } from '../../services/workshop'
import { FocusModeLayout } from './FocusModeLayout'
import { BreakScreen } from './BreakScreen'
import { VotingView } from './VotingView'
import { StickyNotesView } from './StickyNotesView'
import { MatrixView } from './MatrixView'
import { supabase } from '../../services/supabase'
import { Database } from '../../types/database'

type Workshop = Database['public']['Tables']['workshops']['Row']
type Session = Database['public']['Tables']['sessions']['Row']
type DisplayMode = 'timer' | 'voting' | 'sticky_notes' | 'matrix'

interface BeamerDashboardProps {
  workshopId: string
}

export function BeamerDashboard({ workshopId }: BeamerDashboardProps) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('timer')

  const { remainingMs, status, currentSessionId } = useTimer(workshopId)

  useEffect(() => {
    loadWorkshopData()
  }, [workshopId])

  // Subscribe to display mode changes
  useEffect(() => {
    const channel = supabase.channel(`workshop:${workshopId}`)
    
    channel
      .on('broadcast', { event: 'display_mode_change' }, ({ payload }) => {
        setDisplayMode(payload.mode)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [workshopId])

  const loadWorkshopData = async () => {
    try {
      setLoading(true)
      const [workshopData, sessionsData] = await Promise.all([
        WorkshopService.getWorkshop(workshopId),
        WorkshopService.getSessions(workshopId),
      ])
      setWorkshop(workshopData)
      setSessions(sessionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Workshop wird geladen...</Text>
      </View>
    )
  }

  if (error || !workshop) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'Workshop nicht gefunden'}</Text>
      </View>
    )
  }

  if (status === 'idle') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.idleTitle}>{workshop.title}</Text>
        <Text style={styles.idleSubtitle}>Workshop startet in Kürze...</Text>
      </View>
    )
  }

  const currentSession = sessions.find((s) => s.id === currentSessionId)
  const totalMs = currentSession ? currentSession.planned_duration * 60000 : 0

  // Break-Screen für Pausen
  if (currentSession?.type === 'break') {
    return <BreakScreen remainingMs={remainingMs} totalMs={totalMs} />
  }

  // Display-Mode basierte Ansicht
  if (displayMode === 'voting') {
    return <VotingView workshopId={workshopId} sessionId={currentSessionId || ''} />
  }

  if (displayMode === 'sticky_notes') {
    return <StickyNotesView workshopId={workshopId} sessionId={currentSessionId || ''} />
  }

  if (displayMode === 'matrix') {
    return <MatrixView workshopId={workshopId} sessionId={currentSessionId || ''} />
  }

  // Standard: Fokus-Mode Layout mit Timer
  const currentIndex = sessions.findIndex((s) => s.id === currentSessionId)
  const nextSession = currentIndex >= 0 ? sessions[currentIndex + 1] : null

  return (
    <FocusModeLayout
      workshopTitle={workshop.title}
      currentSession={currentSession || null}
      remainingMs={remainingMs}
      totalMs={totalMs}
      nextStep={nextSession?.title}
    />
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 32,
    color: '#94a3b8',
    marginTop: 24,
  },
  errorText: {
    fontSize: 36,
    color: '#ef4444',
    textAlign: 'center',
  },
  idleTitle: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  idleSubtitle: {
    fontSize: 40,
    color: '#94a3b8',
    textAlign: 'center',
  },
})
