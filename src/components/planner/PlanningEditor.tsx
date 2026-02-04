import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Appbar, Text, Button, IconButton, useTheme, Surface, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { WorkshopService } from '../../services/workshop'
import { WorkshopForm } from './WorkshopForm'
import { SessionEditor } from './SessionEditor'
import { TimelineView } from './TimelineView'
import { DraggableSessionList } from './DraggableSessionList'
import { MethodLibrary } from './MethodLibrary'
import { Database } from '../../types/database'

type Workshop = Database['public']['Tables']['workshops']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface PlanningEditorProps {
  workshopId?: string
  onSave?: (workshopId: string) => void
}

export function PlanningEditor({ workshopId, onSave }: PlanningEditorProps) {
  const theme = useTheme()
  const router = useRouter()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [showWorkshopForm, setShowWorkshopForm] = useState(!workshopId)
  const [showSessionEditor, setShowSessionEditor] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | undefined>()
  const [showTimeline, setShowTimeline] = useState(false)
  const [showMethodLibrary, setShowMethodLibrary] = useState(false)

  useEffect(() => {
    if (workshopId) {
      loadWorkshop()
    }
  }, [workshopId])

  const loadWorkshop = async () => {
    if (!workshopId && !workshop?.id) return
    const id = workshopId || workshop?.id
    if (!id) return
    setLoading(true)
    try {
      const [workshopData, sessionsData] = await Promise.all([
        WorkshopService.getWorkshop(id),
        WorkshopService.getSessions(id),
      ])
      setWorkshop(workshopData)
      setSessions(sessionsData)
    } catch (error) {
      Alert.alert('Fehler', 'Workshop konnte nicht geladen werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkshopSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const newWorkshop = await WorkshopService.createWorkshop({
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        total_duration: formData.totalDuration,
        buffer_strategy: formData.bufferStrategy,
      }, formData.userId)
      setWorkshop(newWorkshop)
      setSessions([])
      setShowWorkshopForm(false)
      onSave?.(newWorkshop.id)
    } catch (error) {
      Alert.alert('Fehler', 'Workshop konnte nicht gespeichert werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSave = async (sessionData: any) => {
    if (!workshop) {
      Alert.alert('Fehler', 'Kein Workshop ausgewählt')
      return
    }
    setLoading(true)
    try {
      if (sessionData.id) {
        await WorkshopService.updateSession(sessionData.id, sessionData)
      } else {
        await WorkshopService.createSession({
          ...sessionData,
          workshop_id: workshop.id,
          order_index: sessions.length,
        })
      }
      await loadWorkshop()
      setShowSessionEditor(false)
      setEditingSession(undefined)
    } catch (error) {
      Alert.alert('Fehler', 'Session konnte nicht gespeichert werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionDelete = async (sessionId: string) => {
    Alert.alert('Session löschen', 'Möchtest du diese Session wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await WorkshopService.deleteSession(sessionId)
            await loadWorkshop()
          } catch (error) {
            Alert.alert('Fehler', 'Session konnte nicht gelöscht werden')
          }
        },
      },
    ])
  }

  const handleSessionReorder = async (reorderedSessions: Session[]) => {
    const updatedSessions = reorderedSessions.map((session, index) => ({
      ...session,
      order_index: index,
    }))
    setSessions(updatedSessions)
    try {
      await Promise.all(
        updatedSessions.map((session) =>
          WorkshopService.updateSession(session.id, { order_index: session.order_index })
        )
      )
    } catch (error) {
      Alert.alert('Fehler', 'Reihenfolge konnte nicht gespeichert werden')
      await loadWorkshop()
    }
  }

  const handleTemplateSelect = async (template: any) => {
    if (!workshop) return
    try {
      await WorkshopService.createSession({
        workshop_id: workshop.id,
        title: template.name,
        type: 'interaction',
        planned_duration: template.default_duration || 30,
        description: template.description || '',
        order_index: sessions.length,
        is_buffer: false,
      })
      await loadWorkshop()
      setShowMethodLibrary(false)
    } catch (error) {
      Alert.alert('Fehler', 'Session konnte nicht erstellt werden')
    }
  }

  const totalPlannedDuration = sessions.reduce((sum, s) => sum + s.planned_duration, 0)
  const isOverTime = workshop && totalPlannedDuration > workshop.total_duration

  if (showWorkshopForm) {
    return (
      <WorkshopForm
        initialData={workshop ? {
          title: workshop.title,
          description: workshop.description || '',
          date: workshop.date,
          totalDuration: workshop.total_duration,
          bufferStrategy: workshop.buffer_strategy,
        } : undefined}
        onSubmit={handleWorkshopSubmit}
      />
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={workshop?.title || 'Workshop Planner'} />
        <Appbar.Action
          icon={showMethodLibrary ? 'close' : 'book-open-variant'}
          onPress={() => setShowMethodLibrary(!showMethodLibrary)}
        />
        <Appbar.Action
          icon={showTimeline ? 'format-list-bulleted' : 'chart-timeline'}
          onPress={() => setShowTimeline(!showTimeline)}
        />
      </Appbar.Header>

      <Surface style={[styles.infoBar, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.infoContent}>
          <Text variant="bodyMedium">
            {totalPlannedDuration} / {workshop?.total_duration} min
          </Text>
          {isOverTime && (
            <Chip
              mode="flat"
              icon="alert"
              style={{ backgroundColor: theme.colors.errorContainer }}
              textStyle={{ color: theme.colors.onErrorContainer }}
            >
              Over time!
            </Chip>
          )}
        </View>
      </Surface>

      {showMethodLibrary ? (
        <MethodLibrary onSelectTemplate={handleTemplateSelect} />
      ) : showTimeline ? (
        <TimelineView sessions={sessions} totalDuration={workshop?.total_duration || 0} />
      ) : (
        <DraggableSessionList
          sessions={sessions}
          onReorder={handleSessionReorder}
          onEdit={(s) => {
            setEditingSession(s)
            setShowSessionEditor(true)
          }}
          onDelete={handleSessionDelete}
        />
      )}

      <Button
        mode="contained"
        icon="plus"
        onPress={() => {
          setEditingSession(undefined)
          setShowSessionEditor(true)
        }}
        style={styles.addButton}
      >
        Add Session
      </Button>

      <SessionEditor
        visible={showSessionEditor}
        session={editingSession}
        onSave={handleSessionSave}
        onCancel={() => {
          setShowSessionEditor(false)
          setEditingSession(undefined)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    margin: 16,
    borderRadius: 12,
  },
})
